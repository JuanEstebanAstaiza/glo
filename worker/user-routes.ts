import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Env } from './core-utils';
import { ServiceEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  duration: z.number().int().positive("Duration must be a positive number"),
  price: z.number().int().min(0, "Price cannot be negative"),
  currency: z.enum(["USD", "EUR", "GBP", "JPY"]),
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
}