"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.announcementService = void 0;
const announcement_repository_1 = require("../repositories/announcement.repository");
exports.announcementService = {
    list(query) {
        return announcement_repository_1.announcementRepository.list(query);
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
};
//# sourceMappingURL=announcement.service.js.map