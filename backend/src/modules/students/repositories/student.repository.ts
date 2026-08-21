import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ListStudentsQuery } from "../validations/student.validation";

export const studentRepository = {
  async list(query: ListStudentsQuery, scope?: Prisma.StudentWhereInput) {
    const where: Prisma.StudentWhereInput = {
      ...(query.schoolId ? { schoolId: query.schoolId } : {}),
      classRoomId: query.classRoomId,
      status: query.status,
      ...scope,
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search } },
              { lastName: { contains: query.search } },
              { registrationNo: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { classRoom: true, user: { select: { id: true, email: true, isActive: true } } },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.student.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        classRoom: true,
        user: { select: { id: true, email: true, isActive: true } },
        guardians: true,
        documents: true,
        history: { orderBy: { createdAt: "desc" } },
      },
    });
  },

  countBySchoolAndYear(schoolId: string, year: number) {
    return prisma.student.count({
      where: { schoolId, registrationNo: { startsWith: `ESK-${year}-` } },
    });
  },

  create(data: Prisma.StudentCreateInput) {
    return prisma.student.create({ data });
  },

  update(id: string, data: Prisma.StudentUpdateInput) {
    return prisma.student.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.student.delete({ where: { id } });
  },

  addHistoryEvent(data: {
    studentId: string;
    type: string;
    fromValue?: string;
    toValue?: string;
    reason?: string;
  }) {
    return prisma.studentHistoryEvent.create({ data });
  },

  countBySchool(schoolId: string) {
    return prisma.student.count({ where: { schoolId, status: "ACTIVE" } });
  },
};
