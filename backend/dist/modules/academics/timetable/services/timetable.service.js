"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timetableService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const accessScope_1 = require("../../../../core/utils/accessScope");
const timetable_repository_1 = require("../repositories/timetable.repository");
/**
 * Vérifie qu'un créneau proposé n'entre pas en conflit avec un créneau
 * existant pour le même enseignant, la même classe, ou la même salle.
 * Lève une ConflictError explicite si un chevauchement est détecté —
 * exigence "Détection des conflits" du planning.
 */
async function assertNoConflict(params) {
    const overlaps = await timetable_repository_1.timetableRepository.findOverlapping(params);
    if (overlaps.length === 0)
        return;
    const conflict = overlaps[0];
    const teacherName = `${conflict.teacher.user.firstName} ${conflict.teacher.user.lastName}`;
    if (conflict.teacherId === params.teacherId) {
        throw new AppError_1.ConflictError(`Conflit détecté : l'enseignant ${teacherName} est déjà occupé sur ce créneau (classe ${conflict.classRoom.name})`);
    }
    if (conflict.classRoomId === params.classRoomId) {
        throw new AppError_1.ConflictError(`Conflit détecté : la classe ${conflict.classRoom.name} a déjà un cours sur ce créneau`);
    }
    if (params.room && conflict.room === params.room) {
        throw new AppError_1.ConflictError(`Conflit détecté : la salle ${params.room} est déjà occupée sur ce créneau`);
    }
    throw new AppError_1.ConflictError("Conflit détecté sur ce créneau");
}
exports.timetableService = {
    async list(query, auth) {
        return timetable_repository_1.timetableRepository.list(query, auth ? (await (0, accessScope_1.buildTimetableScope)(auth)) ?? undefined : undefined);
    },
    async create(input) {
        await assertNoConflict(input);
        await timetable_repository_1.timetableRepository.assignTeacherSubject(input.teacherId, input.subjectId, input.classRoomId);
        return timetable_repository_1.timetableRepository.create({
            schoolId: input.schoolId,
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            room: input.room,
            classRoom: { connect: { id: input.classRoomId } },
            subject: { connect: { id: input.subjectId } },
            teacher: { connect: { id: input.teacherId } },
        });
    },
    async update(id, input) {
        const existing = await timetable_repository_1.timetableRepository.findById(id);
        if (!existing)
            throw new AppError_1.NotFoundError("Créneau");
        await assertNoConflict({
            schoolId: existing.schoolId,
            dayOfWeek: input.dayOfWeek ?? existing.dayOfWeek,
            startTime: input.startTime ?? existing.startTime,
            endTime: input.endTime ?? existing.endTime,
            classRoomId: existing.classRoomId,
            teacherId: input.teacherId ?? existing.teacherId,
            room: input.room ?? existing.room ?? undefined,
            excludeId: id,
        });
        await timetable_repository_1.timetableRepository.assignTeacherSubject(input.teacherId ?? existing.teacherId, input.subjectId ?? existing.subjectId, existing.classRoomId);
        return timetable_repository_1.timetableRepository.update(id, input);
    },
    async remove(id) {
        const existing = await timetable_repository_1.timetableRepository.findById(id);
        if (!existing)
            throw new AppError_1.NotFoundError("Créneau");
        await timetable_repository_1.timetableRepository.delete(id);
    },
};
//# sourceMappingURL=timetable.service.js.map