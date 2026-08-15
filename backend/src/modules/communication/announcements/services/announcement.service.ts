import { announcementRepository } from "../repositories/announcement.repository";
import { CreateAnnouncementInput, ListAnnouncementsQuery } from "../validations/announcement.validation";

export const announcementService = {
  list(query: ListAnnouncementsQuery) {
    return announcementRepository.list(query);
  },

  create(input: CreateAnnouncementInput, authorId: string) {
    return announcementRepository.create({
      schoolId: input.schoolId,
      title: input.title,
      body: input.body,
      audience: input.audience,
      author: { connect: { id: authorId } },
    } as never);
  },
};
