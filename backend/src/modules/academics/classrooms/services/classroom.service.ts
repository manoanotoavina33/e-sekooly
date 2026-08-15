import { ConflictError, NotFoundError } from "../../../../core/errors/AppError";
import { AuthContext } from "../../../../core/middlewares/authenticate";
import { buildStudentScopedClassRoomWhere } from "../../../../core/utils/accessScope";
import { classRoomRepository } from "../repositories/classroom.repository";
import { CreateClassRoomInput, UpdateClassRoomInput } from "../validations/classroom.validation";

export const classRoomService = {
  async list(query: Parameters<typeof classRoomRepository.list>[0], auth: AuthContext) {
    return classRoomRepository.list(query, await buildStudentScopedClassRoomWhere(auth) ?? undefined);
  },

  async getById(id: string, auth?: AuthContext) {
    const classRoom = await classRoomRepository.findById(
      id,
      auth ? (await buildStudentScopedClassRoomWhere(auth)) ?? undefined : undefined
    );
    if (!classRoom) throw new NotFoundError("Classe");
    return classRoom;
  },

  create(input: CreateClassRoomInput) {
    return classRoomRepository.create({
      schoolId: input.schoolId,
      name: input.name,
      level: input.level,
      track: input.track,
      section: input.section,
      room: input.room,
      capacity: input.capacity,
      homeroomTeacher: input.homeroomTeacherId ? { connect: { id: input.homeroomTeacherId } } : undefined,
    } as never);
  },

  async update(id: string, input: UpdateClassRoomInput) {
    await this.getById(id);
    return classRoomRepository.update(id, input as never);
  },

  async remove(id: string) {
    await this.getById(id);
    const studentCount = await classRoomRepository.countStudents(id);
    if (studentCount > 0) {
      throw new ConflictError(
        `Impossible de supprimer cette classe : ${studentCount} élève(s) y sont encore inscrits`
      );
    }
    await classRoomRepository.delete(id);
  },
};
