import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListSubjectsQuery } from "../validations/subject.validation";

export const subjectRepository = {
  list(query: ListSubjectsQuery, scope?: Prisma.SubjectWhereInput) {
    const where: Prisma.SubjectWhereInput = {
      schoolId: query.schoolId,
      ...scope,
      ...(query.search ? { name: { contains: query.search } } : {}),
    };
    return prisma.subject.findMany({ where, orderBy: { name: "asc" } });
  },

  findById(id: string, scope?: Prisma.SubjectWhereInput) {
    return prisma.subject.findFirst({
      where: { id, ...scope },
      include: { teacherSubjects: { include: { employee: { include: { user: true } }, classRoom: true } } },
    });
  },

  create(data: Prisma.SubjectCreateInput) {
    return prisma.subject.create({ data });
  },

  update(id: string, data: Prisma.SubjectUpdateInput) {
    return prisma.subject.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.subject.delete({ where: { id } });
  },
};
