"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEmployeesQuerySchema = exports.createSalaryPaymentSchema = exports.assignSubjectSchema = exports.decideLeaveSchema = exports.createLeaveSchema = exports.createContractSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
exports.createEmployeeSchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    position: zod_1.z.string().min(2, "Poste requis"),
    department: zod_1.z.string().optional(),
    hireDate: zod_1.z.coerce.date(),
    degrees: zod_1.z.string().optional(),
    isTeacher: zod_1.z.boolean().default(true),
});
exports.updateEmployeeSchema = zod_1.z.object({
    position: zod_1.z.string().min(2).optional(),
    department: zod_1.z.string().optional(),
    degrees: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createContractSchema = zod_1.z.object({
    type: zod_1.z.enum(["CDI", "CDD", "VACATION", "INTERNSHIP"]),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date().optional(),
    baseSalary: zod_1.z.number().positive("Le salaire doit être positif"),
});
exports.createLeaveSchema = zod_1.z.object({
    type: zod_1.z.enum(["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "OTHER"]),
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    reason: zod_1.z.string().optional(),
});
exports.decideLeaveSchema = zod_1.z.object({
    status: zod_1.z.enum(["APPROVED", "REJECTED"]),
});
exports.assignSubjectSchema = zod_1.z.object({
    subjectId: zod_1.z.string().uuid(),
    classRoomId: zod_1.z.string().uuid().optional(),
});
exports.createSalaryPaymentSchema = zod_1.z.object({
    period: zod_1.z.string().regex(/^\d{4}-\d{2}$/, "Format attendu: AAAA-MM"),
    baseAmount: zod_1.z.number().nonnegative(),
    bonuses: zod_1.z.number().nonnegative().default(0),
    advances: zod_1.z.number().nonnegative().default(0),
    deductions: zod_1.z.number().nonnegative().default(0),
});
exports.listEmployeesQuerySchema = zod_1.z.object({
    schoolId: zod_1.z.string().uuid(),
    search: zod_1.z.string().optional(),
    department: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=employee.validation.js.map