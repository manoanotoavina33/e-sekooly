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
    const { schoolTypes, ...schoolData } = input;
    const school = await schoolRepository.update(id, schoolData);
    if (schoolTypes) {
      await schoolRepository.setSchoolTypes(id, schoolTypes);
    }
    return schoolRepository.findById(id);
  },

  async uploadLogo(id: string, file: Express.Multer.File | undefined) {
    await this.getById(id);
    if (!file) throw new Error("Fichier requis");
    const logoUrl = `/uploads/${file.filename}`;
    return schoolRepository.update(id, { logoUrl } as never);
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

  listCategories() {
    return schoolRepository.listCategories();
  },
};
