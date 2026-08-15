import { NotFoundError, ValidationError } from "../../../../core/errors/AppError";
import { gradeRepository } from "../repositories/grade.repository";
import { BulkGradesInput, ListGradesQuery } from "../validations/grade.validation";

export const gradeService = {
  list(query: ListGradesQuery) {
    return gradeRepository.list(query);
  },

  /** Saisie (en masse) des notes d'une épreuve, avec validation du barème. */
  async bulkSave(input: BulkGradesInput) {
    const exam = await gradeRepository.findExamWithSubject(input.examId);
    if (!exam) throw new NotFoundError("Épreuve");

    for (const entry of input.entries) {
      if (entry.score > exam.maxScore) {
        throw new ValidationError(
          `La note de ${entry.score} dépasse le barème maximum (${exam.maxScore}) pour cette épreuve`
        );
      }
    }

    return Promise.all(
      input.entries.map((entry) => gradeRepository.upsert(input.examId, entry.studentId, entry.score, entry.comment))
    );
  },
};
