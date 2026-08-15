"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffAttendanceRepository = void 0;
exports.toDayStart = toDayStart;
const prisma_1 = require("../../../../config/prisma");
function toDayStart(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
exports.staffAttendanceRepository = {
    findByEmployeeAndDate(employeeId, date) {
        return prisma_1.prisma.staffAttendance.findUnique({
            where: { employeeId_date: { employeeId, date: toDayStart(date) } },
        });
    },
    checkIn(employeeId) {
        const date = toDayStart(new Date());
        return prisma_1.prisma.staffAttendance.upsert({
            where: { employeeId_date: { employeeId, date } },
            update: { checkIn: new Date(), status: "PRESENT" },
            create: { employeeId, date, checkIn: new Date(), status: "PRESENT", method: "MANUAL" },
        });
    },
    checkOut(employeeId) {
        const date = toDayStart(new Date());
        return prisma_1.prisma.staffAttendance.update({
            where: { employeeId_date: { employeeId, date } },
            data: { checkOut: new Date() },
        });
    },
    upsertStatus(params) {
        const date = toDayStart(params.date);
        return prisma_1.prisma.staffAttendance.upsert({
            where: { employeeId_date: { employeeId: params.employeeId, date } },
            update: { status: params.status, note: params.note },
            create: { employeeId: params.employeeId, date, status: params.status, note: params.note, method: "MANUAL" },
        });
    },
    list(query) {
        const where = {
            employeeId: query.employeeId,
            employee: { schoolId: query.schoolId },
            date: {
                gte: query.from ? toDayStart(query.from) : undefined,
                lte: query.to ? toDayStart(query.to) : undefined,
            },
        };
        return prisma_1.prisma.staffAttendance.findMany({
            where,
            include: { employee: { include: { user: { select: { firstName: true, lastName: true } } } } },
            orderBy: { date: "desc" },
        });
    },
};
//# sourceMappingURL=staffAttendance.repository.js.map