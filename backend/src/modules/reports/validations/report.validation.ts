import { z } from "zod";

export const exportReportQuerySchema = z.object({
  format: z.enum(["csv", "xlsx", "pdf"]),
  schoolId: z.string().uuid().optional(),
  classRoomId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  status: z.string().optional(),
  examSessionId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
  cashSessionId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ExportReportQuery = z.infer<typeof exportReportQuerySchema>;
