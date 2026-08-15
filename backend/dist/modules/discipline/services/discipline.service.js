"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplineService = void 0;
const discipline_repository_1 = require("../repositories/discipline.repository");
exports.disciplineService = {
    list(query) {
        return discipline_repository_1.disciplineRepository.list(query);
    },
    create(input, recordedBy) {
        return discipline_repository_1.disciplineRepository.create({
            schoolId: input.schoolId,
            type: input.type,
            severity: input.severity,
            title: input.title,
            description: input.description,
            date: input.date ?? new Date(),
            recordedBy,
            student: { connect: { id: input.studentId } },
        });
    },
    summary(studentId) {
        return discipline_repository_1.disciplineRepository.countByStudent(studentId);
    },
};
//# sourceMappingURL=discipline.service.js.map