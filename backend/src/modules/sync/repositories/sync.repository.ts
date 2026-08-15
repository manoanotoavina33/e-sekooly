import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";

export const syncRepository = {
  logSync(data: Prisma.SyncLogCreateInput) {
    return prisma.syncLog.create({ data });
  },

  history(schoolId: string) {
    return prisma.syncLog.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" }, take: 50 });
  },
};
