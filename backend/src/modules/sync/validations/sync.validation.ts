import { z } from "zod";

export const pullQuerySchema = z.object({
  schoolId: z.string().uuid(),
  deviceId: z.string().min(1),
  since: z.coerce.date().optional(),
});
export type PullQuery = z.infer<typeof pullQuerySchema>;

export const pushBodySchema = z.object({
  schoolId: z.string().uuid(),
  deviceId: z.string().min(1),
  changes: z.record(z.string(), z.array(z.record(z.string(), z.unknown()))),
});
export type PushBody = z.infer<typeof pushBodySchema>;
