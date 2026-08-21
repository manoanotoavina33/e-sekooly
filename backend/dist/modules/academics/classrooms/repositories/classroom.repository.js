"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoomRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.classRoomRepository = {
    list(query, scope) {
        const where = {
            schoolId: query.schoolId,
            ...scope,
            ...(query.search ? { name: { contains: query.search } } : {}),
        };
        return prisma_1.prisma.classRoom.findMany({
            where,
            include: {
                homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
                _count: { select: { students: true } },
            },
            orderBy: { name: "asc" },
        });
    },
    findById(id, scope) {
        return prisma_1.prisma.classRoom.findUnique({
            where: { id },
            include: {
                homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
                students: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
            },
        }).then((classRoom) => {
            if (!classRoom || !scope)
                return classRoom;
            return prisma_1.prisma.classRoom.findFirst({
                where: { id, ...scope },
                include: {
                    homeroomTeacher: { include: { user: { select: { firstName: true, lastName: true } } } },
                    students: { select: { id: true, firstName: true, lastName: true, registrationNo: true } },
                },
            });
        });
    },
    create(data) {
        return prisma_1.prisma.classRoom.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.classRoom.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.classRoom.delete({ where: { id } });
    },
    countStudents(id) {
        return prisma_1.prisma.student.count({ where: { classRoomId: id } });
    },
};
//# sourceMappingURL=classroom.repository.js.map