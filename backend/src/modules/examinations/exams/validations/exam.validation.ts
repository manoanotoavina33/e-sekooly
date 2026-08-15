import { z } from "zod";

export const createExamSessionSchema = z.object({
  schoolId: z.string().uuid(),
  semesterId: z.string().uuid().optional(),
  label: z.string().min(2, "Libellé requis"),
  type: z.enum(["DEVOIR", "COMPOSITION", "EXAM_BLANC", "EXAM_OFFICIEL"]).default("DEVOIR"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export type CreateExamSessionInput = z.infer<typeof createExamSessionSchema>;

export const listExamSessionsQuerySchema = z.object({
  schoolId: z.string().uuid(),
});
export type ListExamSessionsQuery = z.infer<typeof listExamSessionsQuerySchema>;

export const createExamSchema = z.object({
  examSessionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classRoomId: z.string().uuid(),
  date: z.coerce.date(),
  room: z.string().optional(),
  maxScore: z.number().positive().default(20),
  supervisorIds: z.array(z.string().uuid()).optional().default([]),
});
export type CreateExamInput = z.infer<typeof createExamSchema>;

export const listExamsQuerySchema = z.object({
  examSessionId: z.string().uuid().optional(),
  classRoomId: z.string().uuid().optional(),
});
export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;

export const validateDeliberationSchema = z.object({
  status: z.enum(["PENDING", "VALIDATED"]),
});
export type ValidateDeliberationInput = z.infer<typeof validateDeliberationSchema>;
