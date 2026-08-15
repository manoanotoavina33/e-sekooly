import { z } from "zod";

export const createAnnouncementSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().min(2, "Titre requis"),
  body: z.string().min(1, "Contenu requis"),
  audience: z.enum(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "STAFF"]).default("ALL"),
});
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export const listAnnouncementsQuerySchema = z.object({
  schoolId: z.string().uuid(),
  audience: z.enum(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "STAFF"]).optional(),
});
export type ListAnnouncementsQuery = z.infer<typeof listAnnouncementsQuerySchema>;
