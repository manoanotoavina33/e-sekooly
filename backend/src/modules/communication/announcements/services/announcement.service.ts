import { announcementRepository } from "../repositories/announcement.repository";
import { CreateAnnouncementInput, ListAnnouncementsQuery, UpdateAnnouncementInput } from "../validations/announcement.validation";

export const announcementService = {
  list(query: ListAnnouncementsQuery) {
    return announcementRepository.list(query);
  },

  async getById(id: string) {
    const announcement = await announcementRepository.findById(id);
    if (!announcement) throw new Error("Annonce non trouvée");
    return announcement;
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

  update(id: string, input: UpdateAnnouncementInput) {
    return announcementRepository.update(id, input);
  },

  delete(id: string) {
    return announcementRepository.delete(id);
  },
};
