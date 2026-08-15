"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const school_repository_1 = require("../repositories/school.repository");
exports.schoolService = {
    async getById(id) {
        const school = await school_repository_1.schoolRepository.findById(id);
        if (!school)
            throw new AppError_1.NotFoundError("École");
        return school;
    },
    async update(id, input) {
        await this.getById(id);
        return school_repository_1.schoolRepository.update(id, input);
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
};
//# sourceMappingURL=school.service.js.map