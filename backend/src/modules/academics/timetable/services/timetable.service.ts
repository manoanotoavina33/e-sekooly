import { ConflictError, NotFoundError } from "../../../../core/errors/AppError";
import { AuthContext } from "../../../../core/middlewares/authenticate";
import { buildTimetableScope } from "../../../../core/utils/accessScope";
import { timetableRepository } from "../repositories/timetable.repository";
import {
  CreateTimetableSlotInput,
  ListTimetableQuery,
  UpdateTimetableSlotInput,
} from "../validations/timetable.validation";

/**
 * Vérifie qu'un créneau proposé n'entre pas en conflit avec un créneau
 * existant pour le même enseignant, la même classe, ou la même salle.
 * Lève une ConflictError explicite si un chevauchement est détecté —
 * exigence "Détection des conflits" du planning.
 */
async function assertNoConflict(params: {
  schoolId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classRoomId: string;
  teacherId: string;
  room?: string;
  excludeId?: string;
}) {
  const overlaps = await timetableRepository.findOverlapping(params);
  if (overlaps.length === 0) return;

  const conflict = overlaps[0];
  const teacherName = `${conflict.teacher.user.firstName} ${conflict.teacher.user.lastName}`;

  if (conflict.teacherId === params.teacherId) {
    throw new ConflictError(
      `Conflit détecté : l'enseignant ${teacherName} est déjà occupé sur ce créneau (classe ${conflict.classRoom.name})`
    );
  }
  if (conflict.classRoomId === params.classRoomId) {
    throw new ConflictError(`Conflit détecté : la classe ${conflict.classRoom.name} a déjà un cours sur ce créneau`);
  }
  if (params.room && conflict.room === params.room) {
    throw new ConflictError(`Conflit détecté : la salle ${params.room} est déjà occupée sur ce créneau`);
  }
  throw new ConflictError("Conflit détecté sur ce créneau");
}

export const timetableService = {
  async list(query: ListTimetableQuery, auth?: AuthContext) {
    return timetableRepository.list(query, auth ? (await buildTimetableScope(auth)) ?? undefined : undefined);
  },

  async create(input: CreateTimetableSlotInput) {
    await assertNoConflict(input);
    await timetableRepository.assignTeacherSubject(input.teacherId, input.subjectId, input.classRoomId);
    return timetableRepository.create({
      schoolId: input.schoolId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      classRoom: { connect: { id: input.classRoomId } },
      subject: { connect: { id: input.subjectId } },
      teacher: { connect: { id: input.teacherId } },
    } as never);
  },

  async update(id: string, input: UpdateTimetableSlotInput) {
    const existing = await timetableRepository.findById(id);
    if (!existing) throw new NotFoundError("Créneau");

    await assertNoConflict({
      schoolId: existing.schoolId,
      dayOfWeek: input.dayOfWeek ?? (existing.dayOfWeek as string),
      startTime: input.startTime ?? existing.startTime,
      endTime: input.endTime ?? existing.endTime,
      classRoomId: existing.classRoomId,
      teacherId: input.teacherId ?? existing.teacherId,
      room: input.room ?? existing.room ?? undefined,
      excludeId: id,
    });

    await timetableRepository.assignTeacherSubject(
      input.teacherId ?? existing.teacherId,
      (input as any).subjectId ?? existing.subjectId,
      existing.classRoomId
    );

    return timetableRepository.update(id, input as never);
  },

  async remove(id: string) {
    const existing = await timetableRepository.findById(id);
    if (!existing) throw new NotFoundError("Créneau");
    await timetableRepository.delete(id);
  },
};
