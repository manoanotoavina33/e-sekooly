import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListAttendanceQuery } from "../validations/studentAttendance.validation";

/** Normalise une date à minuit (UTC) pour garantir l'unicité "un pointage par jour". */
export function toDayStart(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export const studentAttendanceRepository = {
  findByStudentAndDate(studentId: string, date: Date) {
    return prisma.studentAttendance.findUnique({
      where: { studentId_date: { studentId, date: toDayStart(date) } },
    });
  },

  upsert(params: {
    schoolId: string;
    studentId: string;
    classRoomId?: string;
    date: Date;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    method: "QR" | "MANUAL";
    checkInTime?: Date;
    recordedBy?: string;
    note?: string;
  }) {
    const date = toDayStart(params.date);
    return prisma.studentAttendance.upsert({
      where: { studentId_date: { studentId: params.studentId, date } },
      update: {
        status: params.status,
        method: params.method,
        checkInTime: params.checkInTime,
        recordedBy: params.recordedBy,
        note: params.note,
        classRoomId: params.classRoomId,
      },
      create: {
        schoolId: params.schoolId,
        studentId: params.studentId,
        classRoomId: params.classRoomId,
        date,
        status: params.status,
        method: params.method,
        checkInTime: params.checkInTime,
        recordedBy: params.recordedBy,
        note: params.note,
      },
    });
  },

  list(query: ListAttendanceQuery) {
    const where: Prisma.StudentAttendanceWhereInput = {
      schoolId: query.schoolId,
      classRoomId: query.classRoomId,
      studentId: query.studentId,
      date: {
        gte: query.from ? toDayStart(query.from) : undefined,
        lte: query.to ? toDayStart(query.to) : undefined,
      },
    };
    return prisma.studentAttendance.findMany({
      where,
      include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
      orderBy: { date: "desc" },
    });
  },

  findStudentByQrToken(qrCodeToken: string) {
    return prisma.student.findUnique({ where: { qrCodeToken } });
  },

  /** Agrège le taux de présence par élève sur la période demandée (rapport). */
  async report(query: ListAttendanceQuery) {
    const where: Prisma.StudentAttendanceWhereInput = {
      schoolId: query.schoolId,
      classRoomId: query.classRoomId,
      studentId: query.studentId,
      date: {
        gte: query.from ? toDayStart(query.from) : undefined,
        lte: query.to ? toDayStart(query.to) : undefined,
      },
    };
    const records = await prisma.studentAttendance.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true, registrationNo: true } } },
    });

    const byStudent = new Map<
      string,
      { student: (typeof records)[number]["student"]; present: number; absent: number; late: number; excused: number; total: number }
    >();

    for (const record of records) {
      const entry = byStudent.get(record.studentId) ?? {
        student: record.student,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      };
      entry.total += 1;
      if (record.status === "PRESENT") entry.present += 1;
      if (record.status === "ABSENT") entry.absent += 1;
      if (record.status === "LATE") entry.late += 1;
      if (record.status === "EXCUSED") entry.excused += 1;
      byStudent.set(record.studentId, entry);
    }

    return Array.from(byStudent.values()).map((entry) => ({
      ...entry,
      attendanceRate: entry.total > 0 ? Math.round(((entry.present + entry.late) / entry.total) * 100) : 0,
    }));
  },
};
