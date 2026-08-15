"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timetableRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.timetableRepository = {
    list(query, scope) {
        const where = {
            schoolId: query.schoolId,
            classRoomId: query.classRoomId,
            teacherId: query.teacherId,
            ...scope,
        };
        return prisma_1.prisma.timetableSlot.findMany({
            where,
            include: {
                classRoom: { select: { id: true, name: true } },
                subject: { select: { id: true, name: true } },
                teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        });
    },
    findById(id) {
        return prisma_1.prisma.timetableSlot.findUnique({ where: { id } });
    },
    /**
     * Recherche tout créneau existant qui chevauche (jour + plage horaire) et
     * qui concerne le même enseignant, la même classe OU la même salle —
     * utilisé par le service pour la détection de conflits avant écriture.
     */
    findOverlapping(params) {
        return prisma_1.prisma.timetableSlot.findMany({
            where: {
                schoolId: params.schoolId,
                dayOfWeek: params.dayOfWeek,
                id: params.excludeId ? { not: params.excludeId } : undefined,
                // chevauchement d'intervalles : start < otherEnd AND end > otherStart
                startTime: { lt: params.endTime },
                endTime: { gt: params.startTime },
                OR: [
                    { teacherId: params.teacherId },
                    { classRoomId: params.classRoomId },
                    ...(params.room ? [{ room: params.room }] : []),
                ],
            },
            include: {
                classRoom: { select: { name: true } },
                teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
        });
    },
    create(data) {
        return prisma_1.prisma.timetableSlot.create({ data });
    },
    update(id, data) {
        return prisma_1.prisma.timetableSlot.update({ where: { id }, data });
    },
    delete(id) {
        return prisma_1.prisma.timetableSlot.delete({ where: { id } });
    },
    assignTeacherSubject(employeeId, subjectId, classRoomId) {
        return prisma_1.prisma.teacherSubject.upsert({
            where: { employeeId_subjectId_classRoomId: { employeeId, subjectId, classRoomId } },
            update: {},
            create: { employeeId, subjectId, classRoomId },
        });
    },
};
//# sourceMappingURL=timetable.repository.js.map