import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListClassRoomsQuery } from "../validations/classroom.validation";

export const classRoomRepository = {
  list(query: ListClassRoomsQuery, scope?: Prisma.ClassRoomWhereInput) {
    const where: Prisma.ClassRoomWhereInput = {
      schoolId: query.schoolId,
      ...scope,
      ...(query.search ? { name: { contains: query.search } } : {}),
    };
    return prisma.classRoom.findMany({
      where,
      include: {
        homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  findById(id: string, scope?: Prisma.ClassRoomWhereInput) {
    return prisma.classRoom.findUnique({
      where: { id },
      include: {
        homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
        students: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
      },
    }).then((classRoom) => {
      if (!classRoom || !scope) return classRoom;
      return prisma.classRoom.findFirst({
        where: { id, ...scope },
        include: {
          homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          students: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
        },
      });
    });
  },

  create(data: Prisma.ClassRoomCreateInput) {
    return prisma.classRoom.create({ data });
  },

  update(id: string, data: Prisma.ClassRoomUpdateInput) {
    return prisma.classRoom.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.classRoom.delete({ where: { id } });
  },

  countStudents(id: string) {
    return prisma.student.count({ where: { classRoomId: id } });
  },
};
