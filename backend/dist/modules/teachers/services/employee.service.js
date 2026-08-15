"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../config/prisma");
const AppError_1 = require("../../../core/errors/AppError");
const employee_repository_1 = require("../repositories/employee.repository");
async function generateEmployeeNumber(schoolId) {
    const year = new Date().getFullYear();
    const countThisYear = await employee_repository_1.employeeRepository.countBySchoolAndYear(schoolId, year);
    const sequence = String(countThisYear + 1).padStart(6, "0");
    return `EMP-${year}-${sequence}`;
}
exports.employeeService = {
    async list(query) {
        return employee_repository_1.employeeRepository.list(query);
    },
    async getById(id) {
        const employee = await employee_repository_1.employeeRepository.findById(id);
        if (!employee)
            throw new AppError_1.NotFoundError("Employé");
        return employee;
    },
    /**
     * Crée le compte utilisateur ET le dossier employé en une seule transaction.
     * Le rôle attribué est TEACHER si `isTeacher` est vrai, sinon ADMIN par
     * défaut (à affiner poste par poste dans un futur module RH avancé).
     */
    async create(input) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: input.email } });
        if (existingUser) {
            throw new AppError_1.ConflictError("Un utilisateur avec cet e-mail existe déjà");
        }
        const employeeNo = await generateEmployeeNumber(input.schoolId);
        const passwordHash = await bcryptjs_1.default.hash(input.password, 12);
        const roleName = input.isTeacher ? "TEACHER" : "SECRETARY";
        return prisma_1.prisma.$transaction(async (tx) => {
            const role = await tx.role.findUniqueOrThrow({ where: { name: roleName } });
            const user = await tx.user.create({
                data: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    passwordHash,
                    schoolId: input.schoolId,
                    roles: { create: [{ roleId: role.id }] },
                },
            });
            const employee = await tx.employee.create({
                data: {
                    schoolId: input.schoolId,
                    userId: user.id,
                    employeeNo,
                    position: input.position,
                    department: input.department,
                    hireDate: input.hireDate,
                    degrees: input.degrees,
                },
            });
            return employee;
        });
    },
    async update(id, input) {
        await this.getById(id);
        return employee_repository_1.employeeRepository.update(id, input);
    },
    async delete(id) {
        await this.getById(id);
        return employee_repository_1.employeeRepository.delete(id);
    },
    async addContract(employeeId, input) {
        await this.getById(employeeId);
        return employee_repository_1.employeeRepository.addContract(employeeId, input);
    },
    async requestLeave(employeeId, input) {
        await this.getById(employeeId);
        if (input.endDate < input.startDate) {
            throw new AppError_1.ValidationError("La date de fin ne peut précéder la date de début");
        }
        return employee_repository_1.employeeRepository.createLeave(employeeId, input);
    },
    async decideLeave(leaveId, status, decidedByUserId) {
        return employee_repository_1.employeeRepository.decideLeave(leaveId, status, decidedByUserId);
    },
    async assignSubject(employeeId, subjectId, classRoomId) {
        await this.getById(employeeId);
        return employee_repository_1.employeeRepository.assignSubject(employeeId, subjectId, classRoomId);
    },
    async recordSalaryPayment(employeeId, input) {
        await this.getById(employeeId);
        const netAmount = input.baseAmount + input.bonuses - input.advances - input.deductions;
        return employee_repository_1.employeeRepository.recordSalaryPayment(employeeId, { ...input, netAmount });
    },
    async countActiveTeachers(schoolId) {
        return employee_repository_1.employeeRepository.countActiveTeachers(schoolId);
    },
};
//# sourceMappingURL=employee.service.js.map