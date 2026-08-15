"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAttendanceRepository = void 0;
exports.toDayStart = toDayStart;
const prisma_1 = require("../../../../config/prisma");
/** Normalise une date à minuit (UTC) pour garantir l'unicité "un pointage par jour". */
function toDayStart(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}
exports.studentAttendanceRepository = {
    findByStudentAndDate(studentId, date) {
        return prisma_1.prisma.studentAttendance.findUnique({
            where: { studentId_date: { studentId, date: toDayStart(date) } },
        });
    },
    upsert(params) {
        const date = toDayStart(params.date);
        return prisma_1.prisma.studentAttendance.upsert({
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
    list(query) {
        const where = {
            schoolId: query.schoolId,
            classRoomId: query.classRoomId,
            studentId: query.studentId,
            date: {
                gte: query.from ? toDayStart(query.from) : undefined,
                lte: query.to ? toDayStart(query.to) : undefined,
            },
        };
        return prisma_1.prisma.studentAttendance.findMany({
            where,
            include: { student: { select: { firstName: true, lastName: true, registrationNo: true } } },
            orderBy: { date: "desc" },
        });
    },
    findStudentByQrToken(qrCodeToken) {
        return prisma_1.prisma.student.findUnique({ where: { qrCodeToken } });
    },
    /** Agrège le taux de présence par élève sur la période demandée (rapport). */
    async report(query) {
        const where = {
            schoolId: query.schoolId,
            classRoomId: query.classRoomId,
            studentId: query.studentId,
            date: {
                gte: query.from ? toDayStart(query.from) : undefined,
                lte: query.to ? toDayStart(query.to) : undefined,
            },
        };
        const records = await prisma_1.prisma.studentAttendance.findMany({
            where,
            include: { student: { select: { id: true, firstName: true, lastName: true, registrationNo: true } } },
        });
        const byStudent = new Map();
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
            if (record.status === "PRESENT")
                entry.present += 1;
            if (record.status === "ABSENT")
                entry.absent += 1;
            if (record.status === "LATE")
                entry.late += 1;
            if (record.status === "EXCUSED")
                entry.excused += 1;
            byStudent.set(record.studentId, entry);
        }
        return Array.from(byStudent.values()).map((entry) => ({
            ...entry,
            attendanceRate: entry.total > 0 ? Math.round(((entry.present + entry.late) / entry.total) * 100) : 0,
        }));
    },
};
//# sourceMappingURL=studentAttendance.repository.js.map