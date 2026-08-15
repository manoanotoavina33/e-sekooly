"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const exam_repository_1 = require("../repositories/exam.repository");
exports.examService = {
    listSessions(query) {
        return exam_repository_1.examRepository.listSessions(query);
    },
    async getSessionById(id) {
        const session = await exam_repository_1.examRepository.findSessionById(id);
        if (!session)
            throw new AppError_1.NotFoundError("Session d'examens");
        return session;
    },
    createSession(input) {
        if (input.endDate < input.startDate) {
            throw new AppError_1.ValidationError("La date de fin ne peut précéder la date de début");
        }
        return exam_repository_1.examRepository.createSession({
            schoolId: input.schoolId,
            semesterId: input.semesterId,
            label: input.label,
            type: input.type,
            startDate: input.startDate,
            endDate: input.endDate,
        });
    },
    async validateDeliberation(sessionId, status) {
        await this.getSessionById(sessionId);
        return exam_repository_1.examRepository.updateSessionDeliberation(sessionId, status);
    },
    listExams(query) {
        return exam_repository_1.examRepository.listExams(query);
    },
    async getExamById(id) {
        const exam = await exam_repository_1.examRepository.findExamById(id);
        if (!exam)
            throw new AppError_1.NotFoundError("Épreuve");
        return exam;
    },
    createExam(input) {
        return exam_repository_1.examRepository.createExam({
            examSession: { connect: { id: input.examSessionId } },
            subject: { connect: { id: input.subjectId } },
            classRoom: { connect: { id: input.classRoomId } },
            date: input.date,
            room: input.room,
            maxScore: input.maxScore,
            supervisors: input.supervisorIds.length
                ? { create: input.supervisorIds.map((employeeId) => ({ employee: { connect: { id: employeeId } } })) }
                : undefined,
        });
    },
};
//# sourceMappingURL=exam.service.js.map