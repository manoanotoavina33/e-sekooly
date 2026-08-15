"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffAttendanceService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const staffAttendance_repository_1 = require("../repositories/staffAttendance.repository");
exports.staffAttendanceService = {
    checkIn(input) {
        return staffAttendance_repository_1.staffAttendanceRepository.checkIn(input.employeeId);
    },
    async checkOut(input) {
        const existing = await staffAttendance_repository_1.staffAttendanceRepository.findByEmployeeAndDate(input.employeeId, new Date());
        if (!existing) {
            throw new AppError_1.NotFoundError("Pointage du jour (aucun check-in enregistré)");
        }
        return staffAttendance_repository_1.staffAttendanceRepository.checkOut(input.employeeId);
    },
    async bulkMark(input) {
        return Promise.all(input.entries.map((entry) => staffAttendance_repository_1.staffAttendanceRepository.upsertStatus({
            employeeId: entry.employeeId,
            date: input.date,
            status: entry.status,
            note: entry.note,
        })));
    },
    list(query) {
        return staffAttendance_repository_1.staffAttendanceRepository.list(query);
    },
};
//# sourceMappingURL=staffAttendance.service.js.map