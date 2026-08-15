import { z } from "zod";

export const createSubjectSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1, "Nom de matière requis"),
  coefficient: z.number().positive().default(1),
  hoursPerWeek: z.number().int().positive().default(1),
  program: z.string().optional(),
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial().omit({ schoolId: true });
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export const listSubjectsQuerySchema = z.object({
  schoolId: z.string().uuid(),
  search: z.string().optional(),
});
export type ListSubjectsQuery = z.infer<typeof listSubjectsQuerySchema>;
