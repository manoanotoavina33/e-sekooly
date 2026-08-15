import { Prisma, Weekday } from "@prisma/client";
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

  /**
   * Recherche tout créneau existant qui chevauche (jour + plage horaire) et
   * qui concerne le même enseignant, la même classe OU la même salle —
   * utilisé par le service pour la détection de conflits avant écriture.
   */
  findOverlapping(params: {
    schoolId: string;
    dayOfWeek: Weekday;
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
        // chevauchement d'intervalles : start < otherEnd AND end > otherStart
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
