"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeCategoryService = void 0;
const feeCategory_repository_1 = require("../repositories/feeCategory.repository");
exports.feeCategoryService = {
    list(query) {
        return feeCategory_repository_1.feeCategoryRepository.list(query);
    },
    create(input) {
        return feeCategory_repository_1.feeCategoryRepository.create({
            schoolId: input.schoolId,
            name: input.name,
            description: input.description,
        });
    },
};
//# sourceMappingURL=feeCategory.service.js.map