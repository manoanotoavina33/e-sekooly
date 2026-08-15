"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
exports.isPrivilegedSchoolUser = isPrivilegedSchoolUser;
exports.getStudentProfile = getStudentProfile;
exports.getTeacherProfile = getTeacherProfile;
exports.buildStudentScopedClassRoomWhere = buildStudentScopedClassRoomWhere;
exports.buildSubjectScope = buildSubjectScope;
exports.buildTimetableScope = buildTimetableScope;
const prisma_1 = require("../../config/prisma");
function isSuperAdmin(auth) {
    return auth.roles.includes("SUPER_ADMIN");
}
function isPrivilegedSchoolUser(auth) {
    return isSuperAdmin(auth) || auth.roles.some((role) => ["ADMIN", "DIRECTOR", "SECRETARY", "ACCOUNTANT", "SUPERVISOR"].includes(role));
}
async function getStudentProfile(userId) {
    return prisma_1.prisma.student.findUnique({
        where: { userId },
        select: { id: true, classRoomId: true, schoolId: true },
    });
}
async function getTeacherProfile(userId) {
    return prisma_1.prisma.employee.findUnique({
        where: { userId },
        select: { id: true, schoolId: true },
    });
}
async function buildStudentScopedClassRoomWhere(auth) {
    if (auth.roles.includes("STUDENT")) {
        const student = await getStudentProfile(auth.userId);
        return student?.classRoomId ? { id: student.classRoomId } : { id: "__none__" };
    }
    if (auth.roles.includes("TEACHER")) {
        const teacher = await getTeacherProfile(auth.userId);
        return teacher ? { OR: [{ homeroomTeacherId: teacher.id }, { teacherSubjects: { some: { employeeId: teacher.id } } }] } : { id: "__none__" };
    }
    return null;
}
async function buildSubjectScope(auth) {
    if (auth.roles.includes("STUDENT")) {
        const student = await getStudentProfile(auth.userId);
        return student?.classRoomId
            ? {
                OR: [
                    { teacherSubjects: { some: { classRoomId: student.classRoomId } } },
                    { timetableSlots: { some: { classRoomId: student.classRoomId } } },
                ],
            }
            : { id: "__none__" };
    }
    if (auth.roles.includes("TEACHER")) {
        const teacher = await getTeacherProfile(auth.userId);
        return teacher
            ? {
                OR: [
                    { teacherSubjects: { some: { employeeId: teacher.id } } },
                    { timetableSlots: { some: { teacherId: teacher.id } } },
                ],
            }
            : { id: "__none__" };
    }
    return null;
}
async function buildTimetableScope(auth) {
    if (auth.roles.includes("STUDENT")) {
        const student = await getStudentProfile(auth.userId);
        return student?.classRoomId ? { classRoomId: student.classRoomId } : { id: "__none__" };
    }
    if (auth.roles.includes("TEACHER")) {
        const teacher = await getTeacherProfile(auth.userId);
        return teacher ? { teacherId: teacher.id } : { id: "__none__" };
    }
    return null;
}
//# sourceMappingURL=accessScope.js.map