"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const asyncHandler_1 = require("../../../../core/utils/asyncHandler");
const invoice_service_1 = require("../services/invoice.service");
exports.invoiceController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const invoices = await invoice_service_1.invoiceService.list(req.query);
        res.json({ success: true, data: invoices });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const invoice = await invoice_service_1.invoiceService.getById(req.params.id);
        res.json({ success: true, data: invoice });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const invoice = await invoice_service_1.invoiceService.create(req.body);
        res.status(201).json({ success: true, data: invoice });
    }),
    summary: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const schoolId = req.query.schoolId;
        const summary = await invoice_service_1.invoiceService.financeSummary(schoolId);
        res.json({ success: true, data: summary });
    }),
};
//# sourceMappingURL=invoice.controller.js.map