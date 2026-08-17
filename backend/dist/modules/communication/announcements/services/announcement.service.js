"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementService = void 0;
const announcement_repository_1 = require("../repositories/announcement.repository");
exports.announcementService = {
    list(query) {
        return announcement_repository_1.announcementRepository.list(query);
    },
    async getById(id) {
        const announcement = await announcement_repository_1.announcementRepository.findById(id);
        if (!announcement)
            throw new Error("Annonce non trouvée");
        return announcement;
    },
    create(input, authorId) {
        return announcement_repository_1.announcementRepository.create({
            schoolId: input.schoolId,
            title: input.title,
            body: input.body,
            audience: input.audience,
            author: { connect: { id: authorId } },
        });
    },
    update(id, input) {
        return announcement_repository_1.announcementRepository.update(id, input);
    },
    delete(id) {
        return announcement_repository_1.announcementRepository.delete(id);
    },
};
//# sourceMappingURL=announcement.service.js.map