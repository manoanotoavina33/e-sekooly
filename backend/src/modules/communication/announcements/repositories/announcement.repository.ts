import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListAnnouncementsQuery, UpdateAnnouncementInput } from "../validations/announcement.validation";

export const announcementRepository = {
  list(query: ListAnnouncementsQuery) {
    const where: Prisma.AnnouncementWhereInput = {
      schoolId: query.schoolId,
      ...(query.audience ? { OR: [{ audience: query.audience }, { audience: "ALL" }] } : {}),
    };
    return prisma.announcement.findMany({
      where,
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { publishedAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  },

  create(data: Prisma.AnnouncementCreateInput) {
    return prisma.announcement.create({ data });
  },

  update(id: string, data: UpdateAnnouncementInput) {
    return prisma.announcement.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.announcement.delete({ where: { id } });
  },
};
