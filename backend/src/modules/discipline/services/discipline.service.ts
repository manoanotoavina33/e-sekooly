import { disciplineRepository } from "../repositories/discipline.repository";
import { CreateDisciplineRecordInput, ListDisciplineQuery } from "../validations/discipline.validation";

export const disciplineService = {
  list(query: ListDisciplineQuery) {
    return disciplineRepository.list(query);
  },

  create(input: CreateDisciplineRecordInput, recordedBy?: string) {
    return disciplineRepository.create({
      schoolId: input.schoolId,
      type: input.type,
      severity: input.severity,
      title: input.title,
      description: input.description,
      date: input.date ?? new Date(),
      recordedBy,
      student: { connect: { id: input.studentId } },
    } as never);
  },

  summary(studentId: string) {
    return disciplineRepository.countByStudent(studentId);
  },
};
