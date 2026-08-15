import { z } from "zod";

export const gradeEntrySchema = z.object({
  studentId: z.string().uuid(),
  score: z.number().min(0, "La note ne peut être négative"),
  comment: z.string().optional(),
});

export const bulkGradesSchema = z.object({
  examId: z.string().uuid(),
  entries: z.array(gradeEntrySchema).min(1, "Au moins une note requise"),
});
export type BulkGradesInput = z.infer<typeof bulkGradesSchema>;

export const listGradesQuerySchema = z.object({
  examId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});
export type ListGradesQuery = z.infer<typeof listGradesQuerySchema>;
