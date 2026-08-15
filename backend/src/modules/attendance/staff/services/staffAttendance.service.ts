import { NotFoundError } from "../../../../core/errors/AppError";
import { staffAttendanceRepository } from "../repositories/staffAttendance.repository";
import {
  ListStaffAttendanceQuery,
  StaffBulkAttendanceInput,
  StaffCheckinInput,
  StaffCheckoutInput,
} from "../validations/staffAttendance.validation";

export const staffAttendanceService = {
  checkIn(input: StaffCheckinInput) {
    return staffAttendanceRepository.checkIn(input.employeeId);
  },

  async checkOut(input: StaffCheckoutInput) {
    const existing = await staffAttendanceRepository.findByEmployeeAndDate(input.employeeId, new Date());
    if (!existing) {
      throw new NotFoundError("Pointage du jour (aucun check-in enregistré)");
    }
    return staffAttendanceRepository.checkOut(input.employeeId);
  },

  async bulkMark(input: StaffBulkAttendanceInput) {
    return Promise.all(
      input.entries.map((entry) =>
        staffAttendanceRepository.upsertStatus({
          employeeId: entry.employeeId,
          date: input.date,
          status: entry.status,
          note: entry.note,
        })
      )
    );
  },

  list(query: ListStaffAttendanceQuery) {
    return staffAttendanceRepository.list(query);
  },
};
