import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListTimetableQuery } from "../validations/timetable.validation";

export const timetableRepository = {
  list(query: ListTimetableQuery, scope?: Prisma.TimetableSlotWhereInput) {
    const where: Prisma.TimetableSlotWhereInput = {
      schoolId: query.schoolId,
      classRoomId: query.classRoomId,
      teacherId: query.teacherId,
      ...scope,
    };
    return prisma.timetableSlot.findMany({
      where,
      include: {
        classRoom: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  findById(id: string) {
    return prisma.timetableSlot.findUnique({ where: { id } });
  },

  findOverlapping(params: {
    schoolId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    classRoomId: string;
    teacherId: string;
    room?: string;
    excludeId?: string;
  }) {
    return prisma.timetableSlot.findMany({
      where: {
        schoolId: params.schoolId,
        dayOfWeek: params.dayOfWeek,
        id: params.excludeId ? { not: params.excludeId } : undefined,
        startTime: { lt: params.endTime },
        endTime: { gt: params.startTime },
        OR: [
          { teacherId: params.teacherId },
          { classRoomId: params.classRoomId },
          ...(params.room ? [{ room: params.room }] : []),
        ],
      },
      include: {
        classRoom: { select: { name: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  },

  create(data: Prisma.TimetableSlotCreateInput) {
    return prisma.timetableSlot.create({ data });
  },

  update(id: string, data: Prisma.TimetableSlotUpdateInput) {
    return prisma.timetableSlot.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.timetableSlot.delete({ where: { id } });
  },

  assignTeacherSubject(employeeId: string, subjectId: string, classRoomId: string) {
    return prisma.teacherSubject.upsert({
      where: { employeeId_subjectId_classRoomId: { employeeId, subjectId, classRoomId } },
      update: {},
      create: { employeeId, subjectId, classRoomId },
    });
  },
};
