"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeCategoryController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const feeCategory_service_1 = require("../services/feeCategory.service");
exports.feeCategoryController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const categories = await feeCategory_service_1.feeCategoryService.list(req.query);
        res.json({ success: true, data: categories });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const category = await feeCategory_service_1.feeCategoryService.create(req.body);
        res.status(201).json({ success: true, data: category });
    }),
};
//# sourceMappingURL=feeCategory.controller.js.map