"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const asyncHandler_1 = require("../../../core/utils/asyncHandler");
const user_repository_1 = require("../repositories/user.repository");
const prisma_1 = require("../../../config/prisma");
exports.userController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const users = await user_repository_1.userRepository.list(query);
        res.json({ success: true, data: users });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_repository_1.userRepository.create(req.body);
        res.status(201).json({ success: true, data: user });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_repository_1.userRepository.update(req.params.id, req.body);
        res.json({ success: true, data: user });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await user_repository_1.userRepository.delete(req.params.id);
        res.json({ success: true });
    }),
    roles: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const roles = await prisma_1.prisma.role.findMany({ orderBy: { label: "asc" } });
        res.json({ success: true, data: roles });
    }),
};
//# sourceMappingURL=user.controller.js.map