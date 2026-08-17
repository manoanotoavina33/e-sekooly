import { z } from "zod";

export const createEmployeeSchema = z.object({
  schoolId: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  position: z.string().min(2, "Poste requis"),
  department: z.string().optional(),
  hireDate: z.coerce.date(),
  degrees: z.string().optional(),
  isTeacher: z.boolean().default(true),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  position: z.string().min(2).optional(),
  department: z.string().optional(),
  degrees: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const createLeaveSchema = z.object({
  type: z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().optional(),
});
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;

export const decideLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type DecideLeaveInput = z.infer<typeof decideLeaveSchema>;

export const assignSubjectSchema = z.object({
  subjectId: z.string().uuid(),
  classRoomId: z.string().uuid().optional(),
});
export type AssignSubjectInput = z.infer<typeof assignSubjectSchema>;

export const createSalaryPaymentSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Format attendu: AAAA-MM"),
  baseAmount: z.number().nonnegative(),
  bonuses: z.number().nonnegative().default(0),
  advances: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
});
export type CreateSalaryPaymentInput = z.infer<typeof createSalaryPaymentSchema>;

export const listEmployeesQuerySchema = z.object({
  schoolId: z.string().uuid(),
  search: z.string().optional(),
  department: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
