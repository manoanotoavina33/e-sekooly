"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const account_repository_1 = require("../repositories/account.repository");
exports.accountService = {
    list(query) {
        return account_repository_1.accountRepository.list(query);
    },
    async create(input) {
        const existing = await account_repository_1.accountRepository.findByCode(input.schoolId, input.code);
        if (existing) {
            throw new AppError_1.ConflictError("Un compte avec ce code existe déjà");
        }
        return account_repository_1.accountRepository.create({
            schoolId: input.schoolId,
            code: input.code,
            name: input.name,
            type: input.type,
        });
    },
};
//# sourceMappingURL=account.service.js.map