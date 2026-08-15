import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  schoolId: z.string().uuid(),
  unreadOnly: z.coerce.boolean().optional(),
});
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

export const createNotificationSchema = z.object({
  schoolId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  channel: z.enum(["IN_APP", "EMAIL", "SMS"]).default("IN_APP"),
  link: z.string().optional(),
});
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
