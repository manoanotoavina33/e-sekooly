"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalRouter = void 0;
const express_1 = require("express");
const authenticate_1 = require("../../../../core/middlewares/authenticate");
const authorize_1 = require("../../../../core/middlewares/authorize");
const validate_1 = require("../../../../core/middlewares/validate");
const journal_controller_1 = require("../controllers/journal.controller");
const journal_validation_1 = require("../validations/journal.validation");
exports.journalRouter = (0, express_1.Router)();
exports.journalRouter.use(authenticate_1.authenticate);
exports.journalRouter.get("/", (0, authorize_1.authorize)("accounting.read"), (0, validate_1.validateQuery)(journal_validation_1.listJournalQuerySchema), journal_controller_1.journalController.list);
exports.journalRouter.post("/", (0, authorize_1.authorize)("accounting.manage"), (0, validate_1.validateBody)(journal_validation_1.createJournalEntrySchema), journal_controller_1.journalController.create);
exports.journalRouter.get("/ledger", (0, authorize_1.authorize)("accounting.read"), (0, validate_1.validateQuery)(journal_validation_1.ledgerQuerySchema), journal_controller_1.journalController.ledger);
exports.journalRouter.get("/balance", (0, authorize_1.authorize)("accounting.read"), (0, validate_1.validateQuery)(journal_validation_1.balanceQuerySchema), journal_controller_1.journalController.balance);
//# sourceMappingURL=journal.routes.js.map