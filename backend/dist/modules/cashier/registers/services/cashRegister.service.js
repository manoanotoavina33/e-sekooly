"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashRegisterService = void 0;
const cashRegister_repository_1 = require("../repositories/cashRegister.repository");
exports.cashRegisterService = {
    list(query) {
        if (!query.schoolId)
            return [];
        return cashRegister_repository_1.cashRegisterRepository.findOrCreateDefault(query.schoolId);
    },
    create(input) {
        return cashRegister_repository_1.cashRegisterRepository.create({
            schoolId: input.schoolId,
            name: input.name,
            location: input.location,
        });
    },
};
//# sourceMappingURL=cashRegister.service.js.map