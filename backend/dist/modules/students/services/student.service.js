"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../../config/prisma");
const AppError_1 = require("../../../core/errors/AppError");
const accessScope_1 = require("../../../core/utils/accessScope");
const student_repository_1 = require("../repositories/student.repository");
async function generateRegistrationNumber(schoolId) {
    const year = new Date().getFullYear();
    const countThisYear = await student_repository_1.studentRepository.countBySchoolAndYear(schoolId, year);
    const sequence = String(countThisYear + 1).padStart(6, "0");
    return `ESK-${year}-${sequence}`;
}
function generateQrToken() {
    return crypto_1.default.randomBytes(16).toString("hex");
}
async function buildStudentListScope(auth) {
    if (auth.roles.includes("STUDENT")) {
        return { userId: auth.userId };
    }
    if (auth.roles.includes("TEACHER") && !(0, accessScope_1.isPrivilegedSchoolUser)(auth)) {
        const teacher = await (0, accessScope_1.getTeacherProfile)(auth.userId);
        return teacher ? { classRoom: { teacherSubjects: { some: { employeeId: teacher.id } } } } : { id: "__none__" };
    }
    return undefined;
}
async function assertCanReadStudent(auth, student) {
    if ((0, accessScope_1.isSuperAdmin)(auth) || (0, accessScope_1.isPrivilegedSchoolUser)(auth))
        return;
    if (auth.roles.includes("STUDENT")) {
        if (student.userId !== auth.userId)
            throw new AppError_1.ForbiddenError();
        return;
    }
    if (auth.roles.includes("TEACHER")) {
        const teacher = await (0, accessScope_1.getTeacherProfile)(auth.userId);
        const assignment = teacher
            ? await prisma_1.prisma.teacherSubject.findFirst({
                where: { employeeId: teacher.id, classRoomId: student.classRoomId ?? undefined },
                select: { id: true },
            })
            : null;
        if (!assignment)
            throw new AppError_1.ForbiddenError();
    }
}
exports.studentService = {
    async list(query, auth) {
        return student_repository_1.studentRepository.list(query, await buildStudentListScope(auth));
    },
    async getById(id, auth) {
        const student = await student_repository_1.studentRepository.findById(id);
        if (!student)
            throw new AppError_1.NotFoundError("Eleve");
        if (auth)
            await assertCanReadStudent(auth, student);
        return student;
    },
    async create(input) {
        const registrationNo = await generateRegistrationNumber(input.schoolId);
        const qrCodeToken = generateQrToken();
        return prisma_1.prisma.$transaction(async (tx) => {
            let userId;
            let temporaryPassword;
            if (input.email) {
                const studentRole = await tx.role.findUniqueOrThrow({ where: { name: "STUDENT" } });
                const existingUser = await tx.user.findUnique({
                    where: { email: input.email },
                    include: { student: true, roles: true },
                });
                if (existingUser?.student) {
                    throw new AppError_1.ConflictError("Un compte etudiant existe deja pour cet e-mail");
                }
                if (existingUser) {
                    userId = existingUser.id;
                    const hasStudentRole = existingUser.roles.some((role) => role.roleId === studentRole.id);
                    if (!hasStudentRole) {
                        await tx.userRole.create({ data: { userId, roleId: studentRole.id } });
                    }
                }
                else {
                    temporaryPassword = crypto_1.default.randomBytes(6).toString("base64url");
                    const passwordHash = await bcryptjs_1.default.hash(temporaryPassword, 12);
                    const user = await tx.user.create({
                        data: {
                            firstName: input.firstName,
                            lastName: input.lastName,
                            email: input.email,
                            passwordHash,
                            schoolId: input.schoolId,
                            roles: { create: [{ roleId: studentRole.id }] },
                        },
                    });
                    userId = user.id;
                }
            }
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
                    email: input.email || undefined,
                    schoolId: input.schoolId,
                    user: userId ? { connect: { id: userId } } : undefined,
                    classRoom: input.classRoomId ? { connect: { id: input.classRoomId } } : undefined,
                },
                include: { classRoom: true, user: { select: { id: true, email: true, isActive: true } } },
            });
            return { ...student, temporaryPassword };
        });
    },
    async update(id, input) {
        await this.getById(id);
        return student_repository_1.studentRepository.update(id, input);
    },
    async changeClass(id, input) {
        const student = await this.getById(id);
        await student_repository_1.studentRepository.update(id, { classRoom: { connect: { id: input.classRoomId } } });
        await student_repository_1.studentRepository.addHistoryEvent({
            studentId: id,
            type: "CLASS_CHANGE",
            fromValue: student.classRoomId ?? undefined,
            toValue: input.classRoomId,
            reason: input.reason,
        });
    },
    async suspendOrExclude(id, input) {
        const student = await this.getById(id);
        const newStatus = input.type === "EXCLUSION" ? "EXCLUDED" : "SUSPENDED";
        await student_repository_1.studentRepository.update(id, { status: newStatus });
        await student_repository_1.studentRepository.addHistoryEvent({
            studentId: id,
            type: input.type,
            fromValue: student.status,
            toValue: newStatus,
            reason: input.reason,
        });
    },
    async reactivate(id) {
        await this.getById(id);
        await student_repository_1.studentRepository.update(id, { status: "ACTIVE" });
        await student_repository_1.studentRepository.addHistoryEvent({ studentId: id, type: "RE_ENROLLMENT" });
    },
    async delete(id) {
        await this.getById(id);
        await student_repository_1.studentRepository.delete(id);
    },
    async countActive(schoolId) {
        return student_repository_1.studentRepository.countBySchool(schoolId);
    },
};
//# sourceMappingURL=student.service.js.map