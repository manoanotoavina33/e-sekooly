import { financialAidRepository } from "../repositories/financialAid.repository";
import { CreateFinancialAidInput, ListFinancialAidQuery } from "../validations/financialAid.validation";

export const financialAidService = {
  list(query: ListFinancialAidQuery) {
    return financialAidRepository.list(query);
  },

  create(input: CreateFinancialAidInput) {
    return financialAidRepository.create({
      schoolId: input.schoolId,
      type: input.type,
      label: input.label,
      percentage: input.percentage,
      fixedAmount: input.fixedAmount,
      student: { connect: { id: input.studentId } },
    } as never);
  },

  /**
   * Calcule la réduction totale applicable à un montant donné, en cumulant
   * toutes les bourses/réductions actives de l'élève, plafonnée au montant
   * de la facture.
   */
  async computeDiscount(studentId: string, baseAmount: number): Promise<number> {
    const aids = await financialAidRepository.listActiveForStudent(studentId);
    let totalDiscount = 0;

    for (const aid of aids) {
      if (aid.percentage) {
        totalDiscount += (baseAmount * aid.percentage) / 100;
      } else if (aid.fixedAmount) {
        totalDiscount += aid.fixedAmount;
      }
    }

    totalDiscount = Math.min(totalDiscount, baseAmount);
    return Math.round(totalDiscount * 100) / 100;
  },
};
