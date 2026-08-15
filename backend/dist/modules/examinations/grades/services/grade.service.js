"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const grade_repository_1 = require("../repositories/grade.repository");
exports.gradeService = {
    list(query) {
        return grade_repository_1.gradeRepository.list(query);
    },
    /** Saisie (en masse) des notes d'une épreuve, avec validation du barème. */
    async bulkSave(input) {
        const exam = await grade_repository_1.gradeRepository.findExamWithSubject(input.examId);
        if (!exam)
            throw new AppError_1.NotFoundError("Épreuve");
        for (const entry of input.entries) {
            if (entry.score > exam.maxScore) {
                throw new AppError_1.ValidationError(`La note de ${entry.score} dépasse le barème maximum (${exam.maxScore}) pour cette épreuve`);
            }
        }
        return Promise.all(input.entries.map((entry) => grade_repository_1.gradeRepository.upsert(input.examId, entry.studentId, entry.score, entry.comment)));
    },
};
//# sourceMappingURL=grade.service.js.map