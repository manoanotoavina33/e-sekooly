import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ConflictError, NotFoundError, ValidationError } from "../../../core/errors/AppError";
import { employeeRepository } from "../repositories/employee.repository";
import {
  CreateContractInput,
  CreateEmployeeInput,
  CreateLeaveInput,
  CreateSalaryPaymentInput,
  UpdateEmployeeInput,
} from "../validations/employee.validation";

async function generateEmployeeNumber(schoolId: string) {
  const year = new Date().getFullYear();
  const countThisYear = await employeeRepository.countBySchoolAndYear(schoolId, year);
  const sequence = String(countThisYear + 1).padStart(6, "0");
  return `EMP-${year}-${sequence}`;
}

export const employeeService = {
  async list(query: Parameters<typeof employeeRepository.list>[0]) {
    return employeeRepository.list(query);
  },

  async getById(id: string) {
    const employee = await employeeRepository.findById(id);
    if (!employee) throw new NotFoundError("Employé");
    return employee;
  },

  /**
   * Crée le compte utilisateur ET le dossier employé en une seule transaction.
   * Le rôle attribué est TEACHER si `isTeacher` est vrai, sinon ADMIN par
   * défaut (à affiner poste par poste dans un futur module RH avancé).
   */
  async create(input: CreateEmployeeInput) {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new ConflictError("Un utilisateur avec cet e-mail existe déjà");
    }

    const employeeNo = await generateEmployeeNumber(input.schoolId);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const roleName = input.isTeacher ? "TEACHER" : "SECRETARY";

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

  async update(id: string, input: UpdateEmployeeInput) {
    await this.getById(id);
    return employeeRepository.update(id, input);
  },

  async delete(id: string) {
    await this.getById(id);
    return employeeRepository.delete(id);
  },

  async addContract(employeeId: string, input: CreateContractInput) {
    await this.getById(employeeId);
    return employeeRepository.addContract(employeeId, input);
  },

  async requestLeave(employeeId: string, input: CreateLeaveInput) {
    await this.getById(employeeId);
    if (input.endDate < input.startDate) {
      throw new ValidationError("La date de fin ne peut précéder la date de début");
    }
    return employeeRepository.createLeave(employeeId, input);
  },

  async decideLeave(leaveId: string, status: "APPROVED" | "REJECTED", decidedByUserId: string) {
    return employeeRepository.decideLeave(leaveId, status, decidedByUserId);
  },

  async assignSubject(employeeId: string, subjectId: string, classRoomId?: string) {
    await this.getById(employeeId);
    return employeeRepository.assignSubject(employeeId, subjectId, classRoomId);
  },

  async recordSalaryPayment(employeeId: string, input: CreateSalaryPaymentInput) {
    await this.getById(employeeId);
    const netAmount = input.baseAmount + input.bonuses - input.advances - input.deductions;
    return employeeRepository.recordSalaryPayment(employeeId, { ...input, netAmount });
  },

  async countActiveTeachers(schoolId: string) {
    return employeeRepository.countActiveTeachers(schoolId);
  },
};
