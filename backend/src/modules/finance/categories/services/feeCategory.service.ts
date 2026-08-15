import { feeCategoryRepository } from "../repositories/feeCategory.repository";
import { CreateFeeCategoryInput, ListFeeCategoriesQuery } from "../validations/feeCategory.validation";

export const feeCategoryService = {
  list(query: ListFeeCategoriesQuery) {
    return feeCategoryRepository.list(query);
  },

  create(input: CreateFeeCategoryInput) {
    return feeCategoryRepository.create({
      schoolId: input.schoolId,
      name: input.name,
      description: input.description,
    } as never);
  },
};
