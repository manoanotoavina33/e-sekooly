"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialAidService = void 0;
const financialAid_repository_1 = require("../repositories/financialAid.repository");
exports.financialAidService = {
    list(query) {
        return financialAid_repository_1.financialAidRepository.list(query);
    },
    create(input) {
        return financialAid_repository_1.financialAidRepository.create({
            schoolId: input.schoolId,
            type: input.type,
            label: input.label,
            percentage: input.percentage,
            fixedAmount: input.fixedAmount,
            student: { connect: { id: input.studentId } },
        });
    },
    /**
     * Calcule la réduction totale applicable à un montant donné, en cumulant
     * toutes les bourses/réductions actives de l'élève, plafonnée au montant
     * de la facture.
     */
    async computeDiscount(studentId, baseAmount) {
        const aids = await financialAid_repository_1.financialAidRepository.listActiveForStudent(studentId);
        let totalDiscount = 0;
        for (const aid of aids) {
            if (aid.percentage) {
                totalDiscount += (baseAmount * aid.percentage) / 100;
            }
            else if (aid.fixedAmount) {
                totalDiscount += aid.fixedAmount;
            }
        }
        totalDiscount = Math.min(totalDiscount, baseAmount);
        return Math.round(totalDiscount * 100) / 100;
    },
};
//# sourceMappingURL=financialAid.service.js.map