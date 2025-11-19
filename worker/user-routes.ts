import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { ServiceEntity, AvailabilityEntity, AppointmentEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { Index } from './core-utils';
import { parse, format, addMinutes, isBefore, isEqual, set } from 'date-fns';
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
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SERVICES
  app.get('/api/services', async (c) => {
    const page = await ServiceEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post('/api/services', zValidator('json', serviceSchema), async (c) => {
    const serviceData = c.req.valid('json');
    const newService = { id: crypto.randomUUID(), manicuristId: 'mock-manicurist-id', ...serviceData };
    const created = await ServiceEntity.create(c.env, newService);
    return ok(c, created);
  });
  app.get('/api/services/:id', async (c) => {
    const { id } = c.req.param();
    const service = new ServiceEntity(c.env, id);
    if (!(await service.exists())) return notFound(c, 'Service not found');
    return ok(c, await service.getState());
  });
  app.put('/api/services/:id', zValidator('json', serviceSchema.partial()), async (c) => {
    const { id } = c.req.param();
    const serviceUpdates = c.req.valid('json');
    const service = new ServiceEntity(c.env, id);
    if (!(await service.exists())) return notFound(c, 'Service not found');
    const updated = await service.mutate(current => ({ ...current, ...serviceUpdates }));
    return ok(c, updated);
  });
  app.delete('/api/services/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ServiceEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Service not found');
    return ok(c, { id, deleted });
  });
  // AVAILABILITY
  app.get('/api/availability', async (c) => {
    const page = await AvailabilityEntity.list(c.env);
    return ok(c, page.items);
  });
  app.put('/api/availability', zValidator('json', z.array(availabilitySchema)), async (c) => {
    const availabilityData = c.req.valid('json');
    const manicuristId = 'mock-manicurist-id';
    const updatedAvailabilities = await Promise.all(
        availabilityData.map(async (avail) => {
            const id = `${manicuristId}-${avail.dayOfWeek}`;
            const entity = new AvailabilityEntity(c.env, id);
            const dataToStore = { ...avail, id, manicuristId };
            if (await entity.exists()) {
                return await entity.mutate(() => dataToStore);
            } else {
                return await AvailabilityEntity.create(c.env, dataToStore);
            }
        })
    );
    return ok(c, updatedAvailabilities);
  });
  // BOOKING
  app.get('/api/availability/:manicuristId/slots', async (c) => {
    const { manicuristId } = c.req.param();
    const date = c.req.query('date'); // e.g., '2024-08-15'
    const serviceId = c.req.query('serviceId');
    if (!date || !serviceId) return bad(c, 'Date and Service ID are required.');
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!await serviceEntity.exists()) return notFound(c, 'Service not found');
    const service = await serviceEntity.getState();
    const serviceDuration = service.duration;
    const targetDate = new Date(date);
    const dayOfWeek = format(targetDate, 'eeee').toLowerCase() as ReturnType<typeof availabilitySchema.parse>['dayOfWeek'];
    const availabilityId = `${manicuristId}-${dayOfWeek}`;
    const availabilityEntity = new AvailabilityEntity(c.env, availabilityId);
    if (!await availabilityEntity.exists()) return ok(c, []);
    const availability = await availabilityEntity.getState();
    if (!availability.isEnabled || !availability.startTime || !availability.endTime) return ok(c, []);
    const appointments = await AppointmentEntity.list(c.env);
    const bookedSlots = appointments.items
      .filter(a => a.manicuristId === manicuristId && format(new Date(a.startTime), 'yyyy-MM-dd') === date)
      .map(a => ({ start: new Date(a.startTime), end: new Date(a.endTime) }));
    const availableSlots: string[] = [];
    const dayStart = parse(availability.startTime, 'HH:mm', targetDate);
    const dayEnd = parse(availability.endTime, 'HH:mm', targetDate);
    let currentTime = dayStart;
    while (isBefore(addMinutes(currentTime, serviceDuration), dayEnd) || isEqual(addMinutes(currentTime, serviceDuration), dayEnd)) {
        const slotEnd = addMinutes(currentTime, serviceDuration);
        const isBooked = bookedSlots.some(booked => 
            (isBefore(currentTime, booked.end) && isBefore(booked.start, slotEnd))
        );
        if (!isBooked) {
            availableSlots.push(format(currentTime, "HH:mm"));
        }
        currentTime = addMinutes(currentTime, 15); // Check every 15 minutes
    }
    return ok(c, availableSlots);
  });
  app.post('/api/appointments', zValidator('json', appointmentSchema), async (c) => {
    const { manicuristId, serviceId, startTime } = c.req.valid('json');
    const serviceEntity = new ServiceEntity(c.env, serviceId);
    if (!await serviceEntity.exists()) return notFound(c, 'Service not found');
    const service = await serviceEntity.getState();
    const start = new Date(startTime);
    const end = addMinutes(start, service.duration);
    const newAppointment = {
        id: crypto.randomUUID(),
        clientId: 'mock-client-id', // Replace with actual client ID
        manicuristId,
        serviceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'scheduled' as const,
    };
    const created = await AppointmentEntity.create(c.env, newAppointment);
    return ok(c, created);
  });
}