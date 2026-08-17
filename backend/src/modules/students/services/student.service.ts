import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../../../config/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../core/errors/AppError";
import { AuthContext } from "../../../core/middlewares/authenticate";
import { getTeacherProfile, isPrivilegedSchoolUser, isSuperAdmin } from "../../../core/utils/accessScope";
import { studentRepository } from "../repositories/student.repository";
import {
  ChangeClassInput,
  CreateStudentInput,
  SuspendStudentInput,
  UpdateStudentInput,
} from "../validations/student.validation";

async function generateRegistrationNumber(schoolId: string) {
  const year = new Date().getFullYear();
  const countThisYear = await studentRepository.countBySchoolAndYear(schoolId, year);
  const sequence = String(countThisYear + 1).padStart(6, "0");
  return `ESK-${year}-${sequence}`;
}

function generateQrToken() {
  return crypto.randomBytes(16).toString("hex");
}

async function buildStudentListScope(auth: AuthContext): Promise<Prisma.StudentWhereInput | undefined> {
  if (auth.roles.includes("STUDENT")) {
    return { userId: auth.userId };
  }

  if (auth.roles.includes("TEACHER") && !isPrivilegedSchoolUser(auth)) {
    const teacher = await getTeacherProfile(auth.userId);
    return teacher ? { classRoom: { teacherSubjects: { some: { employeeId: teacher.id } } } } : { id: "__none__" };
  }

  return undefined;
}

async function assertCanReadStudent(auth: AuthContext, student: { userId: string | null; classRoomId: string | null }) {
  if (isSuperAdmin(auth) || isPrivilegedSchoolUser(auth)) return;

  if (auth.roles.includes("STUDENT")) {
    if (student.userId !== auth.userId) throw new ForbiddenError();
    return;
  }

  if (auth.roles.includes("TEACHER")) {
    const teacher = await getTeacherProfile(auth.userId);
    const assignment = teacher
      ? await prisma.teacherSubject.findFirst({
          where: { employeeId: teacher.id, classRoomId: student.classRoomId ?? undefined },
          select: { id: true },
        })
      : null;
    if (!assignment) throw new ForbiddenError();
  }
}

export const studentService = {
  async list(query: Parameters<typeof studentRepository.list>[0], auth: AuthContext) {
    return studentRepository.list(query, await buildStudentListScope(auth));
  },

  async getById(id: string, auth?: AuthContext) {
    const student = await studentRepository.findById(id);
    if (!student) throw new NotFoundError("Eleve");
    if (auth) await assertCanReadStudent(auth, student);
    return student;
  },

  async create(input: CreateStudentInput) {
    const registrationNo = await generateRegistrationNumber(input.schoolId);
    const qrCodeToken = generateQrToken();

    return prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          registrationNo,
          qrCodeToken,
          firstName: input.firstName,
          lastName: input.lastName,
          gender: input.gender,
          dateOfBirth: input.dateOfBirth,
          placeOfBirth: input.placeOfBirth,
          address: input.address,
          phone: input.phone,
          schoolId: input.schoolId,
          classRoom: input.classRoomId ? { connect: { id: input.classRoomId } } : undefined,
        },
        include: { classRoom: true, user: { select: { id: true, email: true, isActive: true } } },
      });

      return student;
    });
  },

  async update(id: string, input: UpdateStudentInput) {
    await this.getById(id);
    return studentRepository.update(id, input as never);
  },

  async changeClass(id: string, input: ChangeClassInput) {
    const student = await this.getById(id);
    await studentRepository.update(id, { classRoom: { connect: { id: input.classRoomId } } });
    await studentRepository.addHistoryEvent({
      studentId: id,
      type: "CLASS_CHANGE",
      fromValue: student.classRoomId ?? undefined,
      toValue: input.classRoomId,
      reason: input.reason,
    });
  },

  async suspendOrExclude(id: string, input: SuspendStudentInput) {
    const student = await this.getById(id);
    const newStatus = input.type === "EXCLUSION" ? "EXCLUDED" : "SUSPENDED";
    await studentRepository.update(id, { status: newStatus as never });
    await studentRepository.addHistoryEvent({
      studentId: id,
      type: input.type,
      fromValue: student.status,
      toValue: newStatus,
      reason: input.reason,
    });
  },

  async reactivate(id: string) {
    await this.getById(id);
    await studentRepository.update(id, { status: "ACTIVE" as never });
    await studentRepository.addHistoryEvent({ studentId: id, type: "RE_ENROLLMENT" });
  },

  async delete(id: string) {
    await this.getById(id);
    await studentRepository.delete(id);
  },

  async countActive(schoolId: string) {
    return studentRepository.countBySchool(schoolId);
  },
};
