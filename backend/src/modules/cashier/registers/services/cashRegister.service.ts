import { cashRegisterRepository } from "../repositories/cashRegister.repository";
import { CreateCashRegisterInput, ListCashRegistersQuery } from "../validations/cashRegister.validation";

export const cashRegisterService = {
  list(query: ListCashRegistersQuery) {
    if (!query.schoolId) return [];
    return cashRegisterRepository.findOrCreateDefault(query.schoolId);
  },

  create(input: CreateCashRegisterInput) {
    return cashRegisterRepository.create({
      schoolId: input.schoolId,
      name: input.name,
      location: input.location,
    } as never);
  },
};
