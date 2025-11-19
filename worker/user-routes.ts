import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { ServiceEntity, AvailabilityEntity, AppointmentEntity, RewardsProgramEntity, ClientEntity } from "./entities";
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
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Seed mock clients for demo
  app.use('*', async (c, next) => {
    await ClientEntity.ensureSeed(c.env);
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
}