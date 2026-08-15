"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAttendanceService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const studentAttendance_repository_1 = require("../repositories/studentAttendance.repository");
exports.studentAttendanceService = {
    /** Pointage via scan du QR code de l'élève (badge). Marque "Présent" à l'instant du scan. */
    async checkinByQr(input, recordedBy) {
        const student = await studentAttendance_repository_1.studentAttendanceRepository.findStudentByQrToken(input.qrCodeToken);
        if (!student || student.schoolId !== input.schoolId) {
            throw new AppError_1.NotFoundError("Élève (QR code invalide pour cet établissement)");
        }
        return studentAttendance_repository_1.studentAttendanceRepository.upsert({
            schoolId: input.schoolId,
            studentId: student.id,
            classRoomId: student.classRoomId ?? undefined,
            date: new Date(),
            status: "PRESENT",
            method: "QR",
            checkInTime: new Date(),
            recordedBy,
        });
    },
    /** Saisie rapide : marque toute une classe en une seule opération. */
    async bulkMark(input, recordedBy) {
        if (input.entries.length === 0) {
            throw new AppError_1.ValidationError("Aucune entrée fournie");
        }
        const results = await Promise.all(input.entries.map((entry) => studentAttendance_repository_1.studentAttendanceRepository.upsert({
            schoolId: input.schoolId,
            studentId: entry.studentId,
            classRoomId: input.classRoomId,
            date: input.date,
            status: entry.status,
            method: "MANUAL",
            note: entry.note,
            recordedBy,
        })));
        return results;
    },
    list(query) {
        return studentAttendance_repository_1.studentAttendanceRepository.list(query);
    },
    report(query) {
        return studentAttendance_repository_1.studentAttendanceRepository.report(query);
    },
};
//# sourceMappingURL=studentAttendance.service.js.map