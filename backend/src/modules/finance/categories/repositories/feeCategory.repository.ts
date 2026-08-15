import { Prisma } from "@prisma/client";
import { prisma } from "../../../../config/prisma";
import { ListFeeCategoriesQuery } from "../validations/feeCategory.validation";

export const feeCategoryRepository = {
  list(query: ListFeeCategoriesQuery) {
    return prisma.feeCategory.findMany({ where: { schoolId: query.schoolId }, orderBy: { name: "asc" } });
  },

  create(data: Prisma.FeeCategoryCreateInput) {
    return prisma.feeCategory.create({ data });
  },

  /** Retrouve ou crée la catégorie système "Paiement Manuel" pour l'école. */
  async findOrCreateManual(schoolId: string) {
    const existing = await prisma.feeCategory.findFirst({
      where: { schoolId, name: "Paiement Manuel" },
    });
    if (existing) return existing;
    return prisma.feeCategory.create({
      data: { schoolId, name: "Paiement Manuel", description: "Catégorie créée automatiquement pour les paiements libres" },
    });
  },
};
