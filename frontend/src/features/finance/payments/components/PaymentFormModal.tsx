import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "../../invoices/hooks/useInvoices";
import { downloadReceiptPdf, useRecordPayment } from "../hooks/usePayments";

const schema = z.object({
  amount: z.coerce.number().positive("Montant requis"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]),
  month: z.coerce.number().optional(),
  year: z.coerce.number().optional(),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const METHOD_LABELS: Record<FormValues["method"], string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CARD: "Carte bancaire",
  CHEQUE: "Chèque",
};

export function PaymentFormModal({ open, onClose, invoice }: { open: boolean; onClose: () => void; invoice: Invoice }) {
  const recordPayment = useRecordPayment();
  const [lastReceiptId, setLastReceiptId] = useState<string | null>(null);
  
  const currentYr = new Date().getFullYear();
  const currentMo = new Date().getMonth() + 1;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: "CASH", month: currentMo, year: currentYr },
  });

  const amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = invoice.amount - invoice.discountAmount - amountPaid;

  async function onSubmit(values: FormValues) {
    const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    let monthLabel = "";
    if (values.month && values.year) {
      monthLabel = `[Mois: ${MONTHS[values.month - 1]} ${values.year}]`;
    }
    const noteText = values.note ? `${monthLabel} ${values.note}`.trim() : monthLabel;

    const payment = await recordPayment.mutateAsync({
      invoiceId: invoice.id,
      amount: values.amount,
      method: values.method,
      note: noteText || undefined,
    });
    setLastReceiptId(payment.id);
    reset({ method: "CASH", month: currentMo, year: currentYr });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Enregistrer un paiement — ${invoice.invoiceNo}`}>
      <div className="mb-4 rounded-xl bg-sky-50 p-3 text-sm dark:bg-ink-700">
        <p className="text-slate-600 dark:text-slate-300">Solde restant dû : <span className="font-bold text-sky-700 dark:text-sky-300">{formatCurrency(balance)}</span></p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Montant versé" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Mode de paiement</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("method")}>
            {Object.entries(METHOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        {/* Mois et Année concernés */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Mois concerné</label>
            <select {...register("month")} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
              {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Année</label>
            <select {...register("year")} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white">
              {[currentYr - 1, currentYr, currentYr + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <Input label="Note (optionnel)" {...register("note")} />

        {lastReceiptId && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Paiement enregistré ✓
            <Button type="button" size="sm" variant="secondary" onClick={() => downloadReceiptPdf(lastReceiptId)}>
              <Download className="h-3.5 w-3.5" /> Reçu PDF
            </Button>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Fermer</Button>
          <Button type="submit" isLoading={isSubmitting}>Enregistrer le paiement</Button>
        </div>
      </form>
    </Modal>
  );
}
