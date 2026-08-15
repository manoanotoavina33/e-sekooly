"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../core/middlewares/authenticate");
const authorize_1 = require("../../../core/middlewares/authorize");
const validate_1 = require("../../../core/middlewares/validate");
const backup_controller_1 = require("../controllers/backup.controller");
const backup_validation_1 = require("../validations/backup.validation");
exports.backupRouter = (0, express_1.Router)();
exports.backupRouter.use(authenticate_1.authenticate);
exports.backupRouter.get("/", (0, authorize_1.authorize)("settings.manage"), (0, validate_1.validateQuery)(backup_validation_1.listBackupsQuerySchema), backup_controller_1.backupController.list);
exports.backupRouter.post("/", (0, authorize_1.authorize)("settings.manage"), (0, validate_1.validateBody)(backup_validation_1.createBackupSchema), backup_controller_1.backupController.create);
exports.backupRouter.post("/restore", (0, authorize_1.authorize)("settings.manage"), (0, validate_1.validateBody)(backup_validation_1.restoreBackupSchema), backup_controller_1.backupController.restore);
//# sourceMappingURL=backup.routes.js.map