import { NotFoundError } from "../../../../core/errors/AppError";
import { schoolRepository } from "../repositories/school.repository";
import {
  CreateSchoolYearInput,
  CreateSemesterInput,
  UpdateSchoolInput,
} from "../validations/school.validation";

export const schoolService = {
  async getById(id: string) {
    const school = await schoolRepository.findById(id);
    if (!school) throw new NotFoundError("École");
    return school;
  },

  async update(id: string, input: UpdateSchoolInput) {
    await this.getById(id);
    return schoolRepository.update(id, input);
  },

  createSchoolYear(input: CreateSchoolYearInput) {
    return schoolRepository.createSchoolYear({
      school: { connect: { id: input.schoolId } },
      label: input.label,
      startDate: input.startDate,
      endDate: input.endDate,
    });
  },

  setCurrentSchoolYear(schoolId: string, schoolYearId: string) {
    return schoolRepository.setCurrentSchoolYear(schoolId, schoolYearId);
  },

  createSemester(input: CreateSemesterInput) {
    return schoolRepository.createSemester({
      schoolYear: { connect: { id: input.schoolYearId } },
      label: input.label,
      startDate: input.startDate,
      endDate: input.endDate,
    });
  },

  listSettings(schoolId: string) {
    return schoolRepository.listSettings(schoolId);
  },

  upsertSetting(schoolId: string, key: string, value: string) {
    return schoolRepository.upsertSetting(schoolId, key, value);
  },
};
