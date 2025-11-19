import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { ServiceEntity, AvailabilityEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  duration: z.number().int().positive("Duration must be a positive number"),
  price: z.number().int().min(0, "Price cannot be negative"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
});
const availabilitySchema = z.object({
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, expected HH:mm"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format, expected HH:mm"),
    isEnabled: z.boolean(),
});
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // SERVICES
  app.get('/api/services', async (c) => {
    // In a real app, you'd filter by manicuristId
    const page = await ServiceEntity.list(c.env);
    return ok(c, page.items);
  });
  app.post(
    '/api/services',
    zValidator('json', serviceSchema),
    async (c) => {
      const serviceData = c.req.valid('json');
      const newService = {
        id: crypto.randomUUID(),
        manicuristId: 'mock-manicurist-id', // Replace with actual authenticated user ID
        ...serviceData,
      };
      const created = await ServiceEntity.create(c.env, newService);
      return ok(c, created);
    }
  );
  app.get('/api/services/:id', async (c) => {
    const { id } = c.req.param();
    const service = new ServiceEntity(c.env, id);
    if (!(await service.exists())) {
      return notFound(c, 'Service not found');
    }
    return ok(c, await service.getState());
  });
  app.put(
    '/api/services/:id',
    zValidator('json', serviceSchema.partial()),
    async (c) => {
      const { id } = c.req.param();
      const serviceUpdates = c.req.valid('json');
      const service = new ServiceEntity(c.env, id);
      if (!(await service.exists())) {
        return notFound(c, 'Service not found');
      }
      const updated = await service.mutate(current => ({ ...current, ...serviceUpdates }));
      return ok(c, updated);
    }
  );
  app.delete('/api/services/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await ServiceEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Service not found');
    }
    return ok(c, { id, deleted });
  });
  // AVAILABILITY
  app.get('/api/availability', async (c) => {
    // In a real app, you'd filter by manicuristId
    const page = await AvailabilityEntity.list(c.env);
    return ok(c, page.items);
  });
  app.put(
    '/api/availability',
    zValidator('json', z.array(availabilitySchema)),
    async (c) => {
        const availabilityData = c.req.valid('json');
        const manicuristId = 'mock-manicurist-id'; // Replace with actual authenticated user ID
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
    }
  );
}