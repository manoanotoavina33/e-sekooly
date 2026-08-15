"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeCategoryRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.feeCategoryRepository = {
    list(query) {
        return prisma_1.prisma.feeCategory.findMany({ where: { schoolId: query.schoolId }, orderBy: { name: "asc" } });
    },
    create(data) {
        return prisma_1.prisma.feeCategory.create({ data });
    },
    /** Retrouve ou crée la catégorie système "Paiement Manuel" pour l'école. */
    async findOrCreateManual(schoolId) {
        const existing = await prisma_1.prisma.feeCategory.findFirst({
            where: { schoolId, name: "Paiement Manuel" },
        });
        if (existing)
            return existing;
        return prisma_1.prisma.feeCategory.create({
            data: { schoolId, name: "Paiement Manuel", description: "Catégorie créée automatiquement pour les paiements libres" },
        });
    },
};
//# sourceMappingURL=feeCategory.repository.js.map