"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cashRegisterRepository = void 0;
const prisma_1 = require("../../../../config/prisma");
exports.cashRegisterRepository = {
    list(query) {
        return prisma_1.prisma.cashRegister.findMany({ where: { schoolId: query.schoolId }, orderBy: { name: "asc" } });
    },
    findOpenSession(cashRegisterId) {
        return prisma_1.prisma.cashSession.findFirst({ where: { cashRegisterId, status: "OPEN" } });
    },
    create(data) {
        return prisma_1.prisma.cashRegister.create({ data });
    },
    async findOrCreateDefault(schoolId) {
        const registers = await prisma_1.prisma.cashRegister.findMany({ where: { schoolId }, orderBy: { name: "asc" } });
        if (registers.length > 0)
            return registers;
        const newReg = await prisma_1.prisma.cashRegister.create({
            data: { schoolId, name: "Caisse Principale", location: "Accueil / Secrétariat" }
        });
        return [newReg];
    },
};
//# sourceMappingURL=cashRegister.repository.js.map