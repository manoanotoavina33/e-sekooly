"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../../../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.userRepository = {
    list(query) {
        const where = {};
        if (query.schoolId)
            where.schoolId = query.schoolId;
        if (query.role) {
            where.roles = { some: { role: { name: query.role } } };
        }
        if (query.search) {
            const q = query.search.toLowerCase();
            where.OR = [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
            ];
        }
        return prisma_1.prisma.user.findMany({
            where,
            include: { roles: { include: { role: true } } },
            orderBy: { createdAt: "desc" },
        });
    },
    findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
    },
    async create(data) {
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        return prisma_1.prisma.user.create({
            data: {
                schoolId: data.schoolId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                passwordHash,
                isActive: data.isActive ?? true,
                roles: { create: data.roleIds.map((roleId) => ({ roleId })) },
            },
            include: { roles: { include: { role: true } } },
        });
    },
    async update(id, data) {
        const updateData = {};
        if (data.firstName)
            updateData.firstName = data.firstName;
        if (data.lastName)
            updateData.lastName = data.lastName;
        if (data.email)
            updateData.email = data.email;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        }
        if (data.roleIds) {
            updateData.roles = { deleteMany: {}, create: data.roleIds.map((roleId) => ({ roleId })) };
        }
        return prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            include: { roles: { include: { role: true } } },
        });
    },
    delete(id) {
        return prisma_1.prisma.user.delete({ where: { id } });
    },
};
//# sourceMappingURL=user.repository.js.map