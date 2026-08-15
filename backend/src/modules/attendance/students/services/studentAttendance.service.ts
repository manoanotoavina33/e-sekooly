import { NotFoundError, ValidationError } from "../../../../core/errors/AppError";
import { studentAttendanceRepository } from "../repositories/studentAttendance.repository";
import {
  AttendanceReportQuery,
  BulkAttendanceInput,
  CheckinByQrInput,
  ListAttendanceQuery,
} from "../validations/studentAttendance.validation";

export const studentAttendanceService = {
  /** Pointage via scan du QR code de l'élève (badge). Marque "Présent" à l'instant du scan. */
  async checkinByQr(input: CheckinByQrInput, recordedBy?: string) {
    const student = await studentAttendanceRepository.findStudentByQrToken(input.qrCodeToken);
    if (!student || student.schoolId !== input.schoolId) {
      throw new NotFoundError("Élève (QR code invalide pour cet établissement)");
    }

    return studentAttendanceRepository.upsert({
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
  async bulkMark(input: BulkAttendanceInput, recordedBy?: string) {
    if (input.entries.length === 0) {
      throw new ValidationError("Aucune entrée fournie");
    }

    const results = await Promise.all(
      input.entries.map((entry) =>
        studentAttendanceRepository.upsert({
          schoolId: input.schoolId,
          studentId: entry.studentId,
          classRoomId: input.classRoomId,
          date: input.date,
          status: entry.status,
          method: "MANUAL",
          note: entry.note,
          recordedBy,
        })
      )
    );

    return results;
  },

  list(query: ListAttendanceQuery) {
    return studentAttendanceRepository.list(query);
  },

  report(query: AttendanceReportQuery) {
    return studentAttendanceRepository.report(query);
  },
};
