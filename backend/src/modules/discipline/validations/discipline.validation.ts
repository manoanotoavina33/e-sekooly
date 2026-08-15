import { z } from "zod";

export const createDisciplineRecordSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  type: z.enum(["SANCTION", "REWARD", "LATENESS", "OBSERVATION"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  title: z.string().min(2, "Titre requis"),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
});
export type CreateDisciplineRecordInput = z.infer<typeof createDisciplineRecordSchema>;

export const listDisciplineQuerySchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
  type: z.enum(["SANCTION", "REWARD", "LATENESS", "OBSERVATION"]).optional(),
});
export type ListDisciplineQuery = z.infer<typeof listDisciplineQuerySchema>;
