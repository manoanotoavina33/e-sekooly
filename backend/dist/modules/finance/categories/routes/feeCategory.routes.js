"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feeCategoryRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const feeCategory_controller_1 = require("../controllers/feeCategory.controller");
const feeCategory_validation_1 = require("../validations/feeCategory.validation");
exports.feeCategoryRouter = (0, express_1.Router)();
exports.feeCategoryRouter.use(authenticate_1.authenticate);
exports.feeCategoryRouter.get("/", (0, authorize_1.authorize)("finance.read"), (0, validate_1.validateQuery)(feeCategory_validation_1.listFeeCategoriesQuerySchema), feeCategory_controller_1.feeCategoryController.list);
exports.feeCategoryRouter.post("/", (0, authorize_1.authorize)("finance.manage"), (0, validate_1.validateBody)(feeCategory_validation_1.createFeeCategorySchema), feeCategory_controller_1.feeCategoryController.create);
//# sourceMappingURL=feeCategory.routes.js.map