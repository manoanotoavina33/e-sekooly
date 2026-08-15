"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classRoomService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const accessScope_1 = require("../../../../core/utils/accessScope");
const classroom_repository_1 = require("../repositories/classroom.repository");
exports.classRoomService = {
    async list(query, auth) {
        return classroom_repository_1.classRoomRepository.list(query, await (0, accessScope_1.buildStudentScopedClassRoomWhere)(auth) ?? undefined);
    },
    async getById(id, auth) {
        const classRoom = await classroom_repository_1.classRoomRepository.findById(id, auth ? (await (0, accessScope_1.buildStudentScopedClassRoomWhere)(auth)) ?? undefined : undefined);
        if (!classRoom)
            throw new AppError_1.NotFoundError("Classe");
        return classRoom;
    },
    create(input) {
        return classroom_repository_1.classRoomRepository.create({
            schoolId: input.schoolId,
            name: input.name,
            level: input.level,
            track: input.track,
            section: input.section,
            room: input.room,
            capacity: input.capacity,
            homeroomTeacher: input.homeroomTeacherId ? { connect: { id: input.homeroomTeacherId } } : undefined,
        });
    },
    async update(id, input) {
        await this.getById(id);
        return classroom_repository_1.classRoomRepository.update(id, input);
    },
    async remove(id) {
        await this.getById(id);
        const studentCount = await classroom_repository_1.classRoomRepository.countStudents(id);
        if (studentCount > 0) {
            throw new AppError_1.ConflictError(`Impossible de supprimer cette classe : ${studentCount} élève(s) y sont encore inscrits`);
        }
        await classroom_repository_1.classRoomRepository.delete(id);
    },
};
//# sourceMappingURL=classroom.service.js.map