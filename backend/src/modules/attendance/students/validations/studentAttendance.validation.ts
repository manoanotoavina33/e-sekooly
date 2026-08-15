import { z } from "zod";

export const checkinByQrSchema = z.object({
  schoolId: z.string().uuid(),
  qrCodeToken: z.string().min(4, "Jeton QR invalide"),
});
export type CheckinByQrInput = z.infer<typeof checkinByQrSchema>;

export const bulkAttendanceEntrySchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  note: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  schoolId: z.string().uuid(),
  classRoomId: z.string().uuid(),
  date: z.coerce.date(),
  entries: z.array(bulkAttendanceEntrySchema).min(1, "Au moins une entrée requise"),
});
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;

export const listAttendanceQuerySchema = z.object({
  schoolId: z.string().uuid(),
  classRoomId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;

export const attendanceReportQuerySchema = listAttendanceQuerySchema;
export type AttendanceReportQuery = z.infer<typeof attendanceReportQuerySchema>;
