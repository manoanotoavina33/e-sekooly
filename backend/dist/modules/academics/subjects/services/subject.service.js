"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subjectService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const accessScope_1 = require("../../../../core/utils/accessScope");
const subject_repository_1 = require("../repositories/subject.repository");
exports.subjectService = {
    async list(query, auth) {
        return subject_repository_1.subjectRepository.list(query, (await (0, accessScope_1.buildSubjectScope)(auth)) ?? undefined);
    },
    async getById(id, auth) {
        const subject = await subject_repository_1.subjectRepository.findById(id, auth ? (await (0, accessScope_1.buildSubjectScope)(auth)) ?? undefined : undefined);
        if (!subject)
            throw new AppError_1.NotFoundError("Matière");
        return subject;
    },
    create(input) {
        return subject_repository_1.subjectRepository.create({
            schoolId: input.schoolId,
            name: input.name,
            coefficient: input.coefficient,
            hoursPerWeek: input.hoursPerWeek,
            program: input.program,
        });
    },
    async update(id, input) {
        await this.getById(id);
        return subject_repository_1.subjectRepository.update(id, input);
    },
    async remove(id) {
        await this.getById(id);
        await subject_repository_1.subjectRepository.delete(id);
    },
};
//# sourceMappingURL=subject.service.js.map