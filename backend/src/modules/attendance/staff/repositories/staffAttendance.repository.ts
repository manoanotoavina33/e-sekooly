import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListStaffAttendanceQuery } from "../validations/staffAttendance.validation";

export function toDayStart(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export const staffAttendanceRepository = {
  findByEmployeeAndDate(employeeId: string, date: Date) {
    return prisma.staffAttendance.findUnique({
      where: { employeeId_date: { employeeId, date: toDayStart(date) } },
    });
  },

  checkIn(employeeId: string) {
    const date = toDayStart(new Date());
    return prisma.staffAttendance.upsert({
      where: { employeeId_date: { employeeId, date } },
      update: { checkIn: new Date(), status: "PRESENT" },
      create: { employeeId, date, checkIn: new Date(), status: "PRESENT", method: "MANUAL" },
    });
  },

  checkOut(employeeId: string) {
    const date = toDayStart(new Date());
    return prisma.staffAttendance.update({
      where: { employeeId_date: { employeeId, date } },
      data: { checkOut: new Date() },
    });
  },

  upsertStatus(params: { employeeId: string; date: Date; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"; note?: string }) {
    const date = toDayStart(params.date);
    return prisma.staffAttendance.upsert({
      where: { employeeId_date: { employeeId: params.employeeId, date } },
      update: { status: params.status, note: params.note },
      create: { employeeId: params.employeeId, date, status: params.status, note: params.note, method: "MANUAL" },
    });
  },

  list(query: ListStaffAttendanceQuery) {
    const where: Prisma.StaffAttendanceWhereInput = {
      employeeId: query.employeeId,
      employee: { schoolId: query.schoolId },
      date: {
        gte: query.from ? toDayStart(query.from) : undefined,
        lte: query.to ? toDayStart(query.to) : undefined,
      },
    };
    return prisma.staffAttendance.findMany({
      where,
      include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } },
      orderBy: { date: "desc" },
    });
  },
};
