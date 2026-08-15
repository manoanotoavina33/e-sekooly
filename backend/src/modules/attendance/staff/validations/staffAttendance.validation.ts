import { z } from "zod";

export const staffCheckinSchema = z.object({
  employeeId: z.string().uuid(),
});
export type StaffCheckinInput = z.infer<typeof staffCheckinSchema>;

export const staffCheckoutSchema = z.object({
  employeeId: z.string().uuid(),
});
export type StaffCheckoutInput = z.infer<typeof staffCheckoutSchema>;

export const staffBulkEntrySchema = z.object({
  employeeId: z.string().uuid(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  note: z.string().optional(),
});

export const staffBulkAttendanceSchema = z.object({
  schoolId: z.string().uuid(),
  date: z.coerce.date(),
  entries: z.array(staffBulkEntrySchema).min(1, "Au moins une entrée requise"),
});
export type StaffBulkAttendanceInput = z.infer<typeof staffBulkAttendanceSchema>;

export const listStaffAttendanceQuerySchema = z.object({
  schoolId: z.string().uuid(),
  employeeId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ListStaffAttendanceQuery = z.infer<typeof listStaffAttendanceQuerySchema>;
