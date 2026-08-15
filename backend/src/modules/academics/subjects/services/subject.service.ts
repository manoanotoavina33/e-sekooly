import { NotFoundError } from "../../../../core/errors/AppError";
import { AuthContext } from "../../../../core/middlewares/authenticate";
import { buildSubjectScope } from "../../../../core/utils/accessScope";
import { subjectRepository } from "../repositories/subject.repository";
import { CreateSubjectInput, UpdateSubjectInput } from "../validations/subject.validation";

export const subjectService = {
  async list(query: Parameters<typeof subjectRepository.list>[0], auth: AuthContext) {
    return subjectRepository.list(query, (await buildSubjectScope(auth)) ?? undefined);
  },

  async getById(id: string, auth?: AuthContext) {
    const subject = await subjectRepository.findById(id, auth ? (await buildSubjectScope(auth)) ?? undefined : undefined);
    if (!subject) throw new NotFoundError("Matière");
    return subject;
  },

  create(input: CreateSubjectInput) {
    return subjectRepository.create({
      schoolId: input.schoolId,
      name: input.name,
      coefficient: input.coefficient,
      hoursPerWeek: input.hoursPerWeek,
      program: input.program,
    } as never);
  },

  async update(id: string, input: UpdateSubjectInput) {
    await this.getById(id);
    return subjectRepository.update(id, input as never);
  },

  async remove(id: string) {
    await this.getById(id);
    await subjectRepository.delete(id);
  },
};
