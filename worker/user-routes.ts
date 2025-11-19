import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { ManicuristEntity, ServiceEntity, AvailabilityEntity, AppointmentEntity, RewardsProgramEntity, ClientEntity, SubscriptionEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { parse, format, addMinutes, isBefore, isEqual } from 'date-fns';
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  duration: z.number().int().positive("Duration must be a positive number"),
  price: z.number().int().min(0, "Price cannot be negative"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
});
const availabilitySchema = z.object({
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, expected HH:mm").optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, expected HH:mm").optional(),
    isEnabled: z.boolean(),
});
const appointmentSchema = z.object({
    manicuristId: z.string(),
    serviceId: z.string(),
    startTime: z.string().datetime(),
});
const rewardsProgramSchema = z.object({
    name: z.string().min(2),
    targetAppointments: z.number().int().positive(),
    rewardDescription: z.string().min(5),
});
const statusUpdateSchema = z.object({
    status: z.enum(['active', 'disabled']),
});
const subscriptionUpdateSchema = z.object({
    plan: z.enum(['solo_artist']),
    status: z.enum(['active', 'cancelled', 'past_due']),
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Seed mock data for demo
  app.use('*', async (c, next) => {
    await ClientEntity.ensureSeed(c.env);
    await ManicuristEntity.ensureSeed(c.env);
    await SubscriptionEntity.ensureSeed(c.env);
    await next();
  });
  // SERVICES
  app.get('/api/services', async (c) => ok(c, (await ServiceEntity.list(c.env)).items));
  app.post('/api/services', zValidator('json', serviceSchema), async (c) => {
    const serviceData = c.req.valid('json');
    const newService = { id: crypto.randomUUID(), manicuristId: 'mock-manicurist-id', ...serviceData };
    return ok(c, await ServiceEntity.create(c.env, newService));
  });
  app.get('/api/services/:id', async (c) => {
    const service = new ServiceEntity(c.env, c.req.param('id'));
    if (!(await service.exists())) return notFound(c, 'Service not found');
    return ok(c, await service.getState());
  });
  app.put('/api/services/:id', zValidator('json', serviceSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const service = new ServiceEntity(c.env, id);
    if (!(await service.exists())) return notFound(c, 'Service not found');
    return ok(c, await service.mutate(current => ({ ...current, ...c.req.valid('json') })));
  });
  app.delete('/api/services/:id', async (c) => {
    const deleted = await ServiceEntity.delete(c.env, c.req.param('id'));
    if (!deleted) return notFound(c, 'Service not found');
    return ok(c, { id: c.req.param('id'), deleted });
  });
  // AVAILABILITY
  app.get('/api/availability', async (c) => ok(c, (await AvailabilityEntity.list(c.env)).items));
  app.put('/api/availability', zValidator('json', z.array(availabilitySchema)), async (c) => {
    const manicuristId = 'mock-manicurist-id';
    const updated = await Promise.all(
        c.req.valid('json').map(async (avail) => {
            const id = `${manicuristId}-${avail.dayOfWeek}`;
            const entity = new AvailabilityEntity(c.env, id);
            const data = { ...avail, id, manicuristId };
            return (await entity.exists()) ? entity.mutate(() => data) : AvailabilityEntity.create(c.env, data);
        })
    );
    return ok(c, updated);
  });
  // BOOKING & APPOINTMENTS
  app.get('/api/availability/:manicuristId/slots', async (c) => {
    const { manicuristId } = c.req.param();
    const { date, serviceId } = c.req.query();
    if (!date || !serviceId) return bad(c, 'Date and Service ID are required.');
    const service = await new ServiceEntity(c.env, serviceId).getState();
    if (!service.id) return notFound(c, 'Service not found');
    const targetDate = new Date(date);
    const dayOfWeek = format(targetDate, 'eeee').toLowerCase() as any;
    const availability = await new AvailabilityEntity(c.env, `${manicuristId}-${dayOfWeek}`).getState();
    if (!availability.isEnabled || !availability.startTime || !availability.endTime) return ok(c, []);
    const appointments = (await AppointmentEntity.list(c.env)).items;
    const bookedSlots = appointments
      .filter(a => a.manicuristId === manicuristId && format(new Date(a.startTime), 'yyyy-MM-dd') === date)
      .map(a => ({ start: new Date(a.startTime), end: new Date(a.endTime) }));
    const availableSlots: string[] = [];
    const dayStart = parse(availability.startTime, 'HH:mm', targetDate);
    const dayEnd = parse(availability.endTime, 'HH:mm', targetDate);
    let currentTime = dayStart;
    while (isBefore(addMinutes(currentTime, service.duration), dayEnd) || isEqual(addMinutes(currentTime, service.duration), dayEnd)) {
        const slotEnd = addMinutes(currentTime, service.duration);
        const isBooked = bookedSlots.some(b => (isBefore(currentTime, b.end) && isBefore(b.start, slotEnd)));
        if (!isBooked) availableSlots.push(format(currentTime, "HH:mm"));
        currentTime = addMinutes(currentTime, 15);
    }
    return ok(c, availableSlots);
  });
  app.get('/api/appointments', async (c) => ok(c, (await AppointmentEntity.list(c.env)).items));
  app.post('/api/appointments', zValidator('json', appointmentSchema), async (c) => {
    const { manicuristId, serviceId, startTime } = c.req.valid('json');
    const service = await new ServiceEntity(c.env, serviceId).getState();
    if (!service.id) return notFound(c, 'Service not found');
    const start = new Date(startTime);
    const newAppointment = {
        id: crypto.randomUUID(),
        clientId: 'mock-client-id',
        manicuristId,
        serviceId,
        startTime: start.toISOString(),
        endTime: addMinutes(start, service.duration).toISOString(),
        status: 'scheduled' as const,
    };
    return ok(c, await AppointmentEntity.create(c.env, newAppointment));
  });
  // CLIENTS
  app.get('/api/clients', async (c) => {
    const manicuristId = 'mock-manicurist-id';
    const [clients, appointments, rewardsPrograms] = await Promise.all([
      ClientEntity.list(c.env),
      AppointmentEntity.list(c.env),
      RewardsProgramEntity.list(c.env),
    ]);
    const rewardsProgram = rewardsPrograms.items.find(p => p.manicuristId === manicuristId);
    const enrichedClients = clients.items.map(client => {
      const clientAppointments = appointments.items.filter(a => a.clientId === client.id && a.status === 'completed');
      const totalAppointments = clientAppointments.length;
      let loyaltyProgress = 0;
      if (rewardsProgram) {
        loyaltyProgress = totalAppointments % rewardsProgram.targetAppointments;
      }
      return {
        ...client,
        totalAppointments,
        loyaltyProgress: rewardsProgram ? loyaltyProgress : undefined,
        targetAppointments: rewardsProgram ? rewardsProgram.targetAppointments : undefined,
      };
    });
    return ok(c, enrichedClients);
  });
  // REWARDS
  app.get('/api/rewards', async (c) => ok(c, (await RewardsProgramEntity.list(c.env)).items));
  app.post('/api/rewards', zValidator('json', rewardsProgramSchema), async (c) => {
    const data = c.req.valid('json');
    const newProgram = { id: crypto.randomUUID(), manicuristId: 'mock-manicurist-id', ...data };
    return ok(c, await RewardsProgramEntity.create(c.env, newProgram));
  });
  app.put('/api/rewards/:id', zValidator('json', rewardsProgramSchema), async (c) => {
    const { id } = c.req.param();
    const entity = new RewardsProgramEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Reward program not found');
    return ok(c, await entity.mutate(current => ({ ...current, ...c.req.valid('json') })));
  });
  // SUPER ADMIN
  app.get('/api/admin/stats', async (c) => {
    const [manicurists, clients, appointments, services] = await Promise.all([
        ManicuristEntity.list(c.env),
        ClientEntity.list(c.env),
        AppointmentEntity.list(c.env),
        ServiceEntity.list(c.env),
    ]);
    const servicesMap = new Map(services.items.map(s => [s.id, s]));
    const totalRevenue = appointments.items
        .filter(a => a.status === 'completed')
        .reduce((sum, app) => sum + (servicesMap.get(app.serviceId)?.price || 0), 0);
    return ok(c, {
        totalManicurists: manicurists.items.length,
        activeManicurists: manicurists.items.filter(m => m.status === 'active').length,
        totalClients: clients.items.length,
        totalRevenue,
    });
  });
  app.get('/api/admin/manicurists', async (c) => {
    const [manicurists, clients, appointments, services] = await Promise.all([
        ManicuristEntity.list(c.env),
        ClientEntity.list(c.env),
        AppointmentEntity.list(c.env),
        ServiceEntity.list(c.env),
    ]);
    const servicesMap = new Map(services.items.map(s => [s.id, s]));
    const clientCounts = clients.items.reduce((acc, client) => {
        acc[client.manicuristId] = (acc[client.manicuristId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const revenueByManicurist = appointments.items
        .filter(a => a.status === 'completed')
        .reduce((acc, app) => {
            const price = servicesMap.get(app.serviceId)?.price || 0;
            acc[app.manicuristId] = (acc[app.manicuristId] || 0) + price;
            return acc;
        }, {} as Record<string, number>);
    const enrichedManicurists = manicurists.items.map(m => ({
        ...m,
        clientCount: clientCounts[m.id] || 0,
        totalRevenue: revenueByManicurist[m.id] || 0,
    }));
    return ok(c, enrichedManicurists);
  });
  app.put('/api/admin/manicurists/:id/status', zValidator('json', statusUpdateSchema), async (c) => {
    const { id } = c.req.param();
    const { status } = c.req.valid('json');
    const entity = new ManicuristEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Manicurist not found');
    await entity.patch({ status });
    return ok(c, { id, status });
  });
  app.get('/api/admin/subscriptions', async (c) => ok(c, (await SubscriptionEntity.list(c.env)).items));
  app.put('/api/admin/subscriptions/:id', zValidator('json', subscriptionUpdateSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const data = c.req.valid('json');
    const entity = new SubscriptionEntity(c.env, id);
    if (!(await entity.exists())) return notFound(c, 'Subscription not found');
    return ok(c, await entity.mutate(current => ({ ...current, ...data })));
  });
}