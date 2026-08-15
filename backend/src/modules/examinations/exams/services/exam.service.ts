import { NotFoundError, ValidationError } from "../../../../core/errors/AppError";
import { examRepository } from "../repositories/exam.repository";
import {
  CreateExamInput,
  CreateExamSessionInput,
  ListExamSessionsQuery,
  ListExamsQuery,
} from "../validations/exam.validation";

export const examService = {
  listSessions(query: ListExamSessionsQuery) {
    return examRepository.listSessions(query);
  },

  async getSessionById(id: string) {
    const session = await examRepository.findSessionById(id);
    if (!session) throw new NotFoundError("Session d'examens");
    return session;
  },

  createSession(input: CreateExamSessionInput) {
    if (input.endDate < input.startDate) {
      throw new ValidationError("La date de fin ne peut précéder la date de début");
    }
    return examRepository.createSession({
      schoolId: input.schoolId,
      semesterId: input.semesterId,
      label: input.label,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
    } as never);
  },

  async validateDeliberation(sessionId: string, status: "PENDING" | "VALIDATED") {
    await this.getSessionById(sessionId);
    return examRepository.updateSessionDeliberation(sessionId, status);
  },

  listExams(query: ListExamsQuery) {
    return examRepository.listExams(query);
  },

  async getExamById(id: string) {
    const exam = await examRepository.findExamById(id);
    if (!exam) throw new NotFoundError("Épreuve");
    return exam;
  },

  createExam(input: CreateExamInput) {
    return examRepository.createExam({
      examSession: { connect: { id: input.examSessionId } },
      subject: { connect: { id: input.subjectId } },
      classRoom: { connect: { id: input.classRoomId } },
      date: input.date,
      room: input.room,
      maxScore: input.maxScore,
      supervisors: input.supervisorIds.length
        ? { create: input.supervisorIds.map((employeeId) => ({ employee: { connect: { id: employeeId } } })) }
        : undefined,
    } as never);
  },
};
