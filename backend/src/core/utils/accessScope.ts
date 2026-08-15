import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AuthContext } from "../middlewares/authenticate";

export function isSuperAdmin(auth: AuthContext) {
  return auth.roles.includes("SUPER_ADMIN");
}

export function isPrivilegedSchoolUser(auth: AuthContext) {
  return isSuperAdmin(auth) || auth.roles.some((role) => ["ADMIN", "DIRECTOR", "SECRETARY", "ACCOUNTANT", "SUPERVISOR"].includes(role));
}

export async function getStudentProfile(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    select: { id: true, classRoomId: true, schoolId: true },
  });
}

export async function getTeacherProfile(userId: string) {
  return prisma.employee.findUnique({
    where: { userId },
    select: { id: true, schoolId: true },
  });
}

export async function buildStudentScopedClassRoomWhere(auth: AuthContext): Promise<Prisma.ClassRoomWhereInput | null> {
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

export async function buildSubjectScope(auth: AuthContext): Promise<Prisma.SubjectWhereInput | null> {
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

export async function buildTimetableScope(auth: AuthContext): Promise<Prisma.TimetableSlotWhereInput | null> {
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
