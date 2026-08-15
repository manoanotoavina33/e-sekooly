"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
exports.computeInvoiceStatus = computeInvoiceStatus;
const AppError_1 = require("../../../../core/errors/AppError");
const financialAid_service_1 = require("../../financialaid/services/financialAid.service");
const invoice_repository_1 = require("../repositories/invoice.repository");
async function generateInvoiceNumber(schoolId) {
    const year = new Date().getFullYear();
    const count = await invoice_repository_1.invoiceRepository.countBySchoolAndYear(schoolId, year);
    return `FAC-${year}-${String(count + 1).padStart(6, "0")}`;
}
/** Recalcule le statut d'une facture à partir du montant payé et de l'échéance. */
function computeInvoiceStatus(params) {
    if (params.amountPaid >= params.amountDue && params.amountDue > 0)
        return "PAID";
    if (params.amountPaid > 0)
        return "PARTIAL";
    if (params.dueDate && params.dueDate < new Date())
        return "OVERDUE";
    return "PENDING";
}
exports.invoiceService = {
    list(query) {
        return invoice_repository_1.invoiceRepository.list(query);
    },
    async getById(id) {
        const invoice = await invoice_repository_1.invoiceRepository.findById(id);
        if (!invoice)
            throw new AppError_1.NotFoundError("Facture");
        return invoice;
    },
    /**
     * Génère une facture pour un élève en appliquant automatiquement les
     * bourses/réductions actives (exigence "Bourses / Réductions" appliquées
     * aux "Frais scolaires").
     */
    async create(input) {
        const discountAmount = await financialAid_service_1.financialAidService.computeDiscount(input.studentId, input.amount);
        const invoiceNo = await generateInvoiceNumber(input.schoolId);
        return invoice_repository_1.invoiceRepository.create({
            schoolId: input.schoolId,
            invoiceNo,
            amount: input.amount,
            discountAmount,
            dueDate: input.dueDate,
            student: { connect: { id: input.studentId } },
            feeCategory: { connect: { id: input.feeCategoryId } },
        });
    },
    financeSummary(schoolId) {
        return invoice_repository_1.invoiceRepository.financeSummary(schoolId);
    },
};
//# sourceMappingURL=invoice.service.js.map