import { Prisma, SchoolType } from "@prisma/client";
import { prisma } from "../../../../config/prisma";

export const schoolRepository = {
  findById(id: string) {
    return prisma.school.findUnique({
      where: { id },
      include: {
        schoolYears: { include: { semesters: true }, orderBy: { startDate: "desc" } },
        schoolTypes: { include: { schoolType: true } },
      },
    });
  },

  update(id: string, data: Prisma.SchoolUpdateInput) {
    return prisma.school.update({ where: { id }, data });
  },

  async setSchoolTypes(schoolId: string, types: string[]) {
    await prisma.schoolSchoolCategory.deleteMany({ where: { schoolId } });
    const categories = await prisma.schoolCategory.findMany({
      where: { code: { in: types as SchoolType[] } },
    });
    await prisma.schoolSchoolCategory.createMany({
      data: categories.map((cat) => ({ schoolId, schoolTypeId: cat.id })),
    });
  },

  createSchoolYear(data: Prisma.SchoolYearCreateInput) {
    return prisma.schoolYear.create({ data });
  },

  setCurrentSchoolYear(schoolId: string, schoolYearId: string) {
    return prisma.$transaction([
      prisma.schoolYear.updateMany({ where: { schoolId }, data: { isCurrent: false } }),
      prisma.schoolYear.update({ where: { id: schoolYearId }, data: { isCurrent: true } }),
    ]);
  },

  createSemester(data: Prisma.SemesterCreateInput) {
    return prisma.semester.create({ data });
  },

  listSettings(schoolId: string) {
    return prisma.systemSetting.findMany({ where: { schoolId } });
  },

  upsertSetting(schoolId: string, key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { schoolId_key: { schoolId, key } },
      update: { value },
      create: { schoolId, key, value },
    });
  },

  listCategories() {
    return prisma.schoolCategory.findMany({ orderBy: { code: "asc" } });
  },
};
