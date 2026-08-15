"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const AppError_1 = require("../../../../core/errors/AppError");
const invoice_repository_1 = require("../../invoices/repositories/invoice.repository");
const invoice_service_1 = require("../../invoices/services/invoice.service");
const accountingIntegration_service_1 = require("../../../accounting/journal/services/accountingIntegration.service");
const payment_repository_1 = require("../repositories/payment.repository");
async function generateReceiptNumber() {
    const year = new Date().getFullYear();
    const count = await payment_repository_1.paymentRepository.countBySchoolAndYear(year);
    return `REC-${year}-${String(count + 1).padStart(6, "0")}`;
}
exports.paymentService = {
    list(opts) {
        return payment_repository_1.paymentRepository.list(opts);
    },
    studentPaymentStatus(schoolId, month, year) {
        return payment_repository_1.paymentRepository.studentPaymentStatus(schoolId, month, year);
    },
    async getById(id) {
        const payment = await payment_repository_1.paymentRepository.findById(id);
        if (!payment)
            throw new AppError_1.NotFoundError("Paiement");
        return payment;
    },
    /**
     * Enregistre un versement, génère son reçu, puis recalcule et met à jour
     * automatiquement le statut de la facture (Pending/Partiel/Payé) —
     * exigence "Paiements / Versements" reliés aux "Factures".
     */
    async record(input, recordedBy) {
        const invoice = await payment_repository_1.paymentRepository.findInvoice(input.invoiceId);
        if (!invoice)
            throw new AppError_1.NotFoundError("Facture");
        if (invoice.status === "CANCELLED") {
            throw new AppError_1.ValidationError("Cette facture a été annulée, aucun paiement ne peut y être ajouté");
        }
        const amountDue = invoice.amount - invoice.discountAmount;
        const receiptNo = await generateReceiptNumber();
        const payment = await payment_repository_1.paymentRepository.create({
            amount: input.amount,
            method: input.method,
            note: input.note,
            receiptNo,
            recordedBy,
            invoice: { connect: { id: input.invoiceId } },
        });
        const totalPaid = await payment_repository_1.paymentRepository.sumForInvoice(input.invoiceId);
        const amountPaid = totalPaid._sum.amount ?? 0;
        const newStatus = (0, invoice_service_1.computeInvoiceStatus)({ amountDue, amountPaid, dueDate: invoice.dueDate });
        await invoice_repository_1.invoiceRepository.updateStatus(input.invoiceId, newStatus);
        // Comptabilisation automatique (Module 10 : Comptabilité). Ne bloque pas
        // le paiement en cas d'échec (ex: contrainte future) — best effort.
        try {
            const fullPayment = await payment_repository_1.paymentRepository.findById(payment.id);
            if (fullPayment) {
                await (0, accountingIntegration_service_1.postPaymentToJournal)({
                    schoolId: invoice.schoolId,
                    paymentId: fullPayment.id,
                    amount: fullPayment.amount,
                    feeCategoryName: fullPayment.invoice.feeCategory.name,
                    studentName: `${fullPayment.invoice.student.firstName} ${fullPayment.invoice.student.lastName}`,
                });
            }
        }
        catch (err) {
            console.warn("Accounting integration skipped/failed:", err);
        }
        return payment;
    },
    /**
     * Paiement rapide de caisse avec motif libre (crée la facture avec catégorie manuelle si nécessaire).
     */
    async recordQuickPayment(input, recordedBy) {
        let targetInvoiceId = input.invoiceId;
        if (!targetInvoiceId) {
            const { feeCategoryRepository } = await Promise.resolve().then(() => __importStar(require("../../categories/repositories/feeCategory.repository")));
            const category = await feeCategoryRepository.findOrCreateManual(input.schoolId);
            const invoice = await invoice_service_1.invoiceService.create({
                schoolId: input.schoolId,
                studentId: input.studentId,
                feeCategoryId: category.id,
                amount: input.amount,
            });
            targetInvoiceId = invoice.id;
        }
        const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        let monthLabel = "";
        if (input.month && input.year) {
            monthLabel = ` [Mois: ${MONTHS[input.month - 1]} ${input.year}]`;
        }
        const fullMotif = `${input.motif}${monthLabel}`;
        const noteText = input.note ? `${fullMotif} — ${input.note}` : fullMotif;
        return this.record({
            invoiceId: targetInvoiceId,
            amount: input.amount,
            method: input.method,
            note: noteText,
        }, recordedBy);
    },
};
//# sourceMappingURL=payment.service.js.map