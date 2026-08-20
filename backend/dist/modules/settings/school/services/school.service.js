"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const school_repository_1 = require("../repositories/school.repository");
exports.schoolService = {
    async list() {
        return school_repository_1.schoolRepository.list();
    },
    async getById(id) {
        const school = await school_repository_1.schoolRepository.findById(id);
        if (!school)
            throw new AppError_1.NotFoundError("École");
        return school;
    },
    async update(id, input) {
        await this.getById(id);
        const { schoolTypes, ...schoolData } = input;
        const school = await school_repository_1.schoolRepository.update(id, schoolData);
        if (schoolTypes) {
            await school_repository_1.schoolRepository.setSchoolTypes(id, schoolTypes);
        }
        return school_repository_1.schoolRepository.findById(id);
    },
    async uploadLogo(id, file) {
        await this.getById(id);
        if (!file)
            throw new Error("Fichier requis");
        const logoUrl = `/uploads/${file.filename}`;
        return school_repository_1.schoolRepository.update(id, { logoUrl });
    },
    createSchoolYear(input) {
        return school_repository_1.schoolRepository.createSchoolYear({
            school: { connect: { id: input.schoolId } },
            label: input.label,
            startDate: input.startDate,
            endDate: input.endDate,
        });
    },
    setCurrentSchoolYear(schoolId, schoolYearId) {
        return school_repository_1.schoolRepository.setCurrentSchoolYear(schoolId, schoolYearId);
    },
    createSemester(input) {
        return school_repository_1.schoolRepository.createSemester({
            schoolYear: { connect: { id: input.schoolYearId } },
            label: input.label,
            startDate: input.startDate,
            endDate: input.endDate,
        });
    },
    listSettings(schoolId) {
        return school_repository_1.schoolRepository.listSettings(schoolId);
    },
    upsertSetting(schoolId, key, value) {
        return school_repository_1.schoolRepository.upsertSetting(schoolId, key, value);
    },
    listCategories() {
        return school_repository_1.schoolRepository.listCategories();
    },
};
//# sourceMappingURL=school.service.js.map