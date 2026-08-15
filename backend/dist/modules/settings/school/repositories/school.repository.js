"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.schoolRepository = {
    findById(id) {
        return prisma_1.prisma.school.findUnique({
            where: { id },
            include: { schoolYears: { include: { semesters: true }, orderBy: { startDate: "desc" } } },
        });
    },
    update(id, data) {
        return prisma_1.prisma.school.update({ where: { id }, data });
    },
    createSchoolYear(data) {
        return prisma_1.prisma.schoolYear.create({ data });
    },
    setCurrentSchoolYear(schoolId, schoolYearId) {
        return prisma_1.prisma.$transaction([
            prisma_1.prisma.schoolYear.updateMany({ where: { schoolId }, data: { isCurrent: false } }),
            prisma_1.prisma.schoolYear.update({ where: { id: schoolYearId }, data: { isCurrent: true } }),
        ]);
    },
    createSemester(data) {
        return prisma_1.prisma.semester.create({ data });
    },
    listSettings(schoolId) {
        return prisma_1.prisma.systemSetting.findMany({ where: { schoolId } });
    },
    upsertSetting(schoolId, key, value) {
        return prisma_1.prisma.systemSetting.upsert({
            where: { schoolId_key: { schoolId, key } },
            update: { value },
            create: { schoolId, key, value },
        });
    },
};
//# sourceMappingURL=school.repository.js.map