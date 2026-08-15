import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListAnnouncementsQuery } from "../validations/announcement.validation";

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

  create(data: Prisma.AnnouncementCreateInput) {
    return prisma.announcement.create({ data });
  },
};
