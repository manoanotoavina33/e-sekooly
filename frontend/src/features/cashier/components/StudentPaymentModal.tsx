import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { formatCurrency } from "@/lib/utils";
import { type PaymentMethod, useRecordQuickPayment } from "@/features/finance/payments/hooks/usePayments";
import type { Invoice } from "@/features/finance/invoices/hooks/useInvoices";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Student } from "@/features/students/hooks/useStudents";
import { useFeeCategories, useStudentPendingInvoices, useStudentSearch } from "../hooks/useCashierPayment";
import { ReceiptData, ReceiptTicket } from "./ReceiptTicket";
import { downloadReceiptPdf } from "@/features/finance/payments/hooks/usePayments";

const PAYMENT_TYPES = [
  { value: "DROITS_SCOLARITE", label: "Droits de scolarité" },
  { value: "FRAIS_FORMATION", label: "Frais de formation" },
  { value: "FRAIS_INSCRIPTION", label: "Frais d'inscription" },
  { value: "FRAIS_EXAMEN", label: "Frais d'examen" },
  { value: "TRANSPORT", label: "Transport scolaire" },
  { value: "CANTINE", label: "Cantine" },
  { value: "UNIFORME", label: "Uniforme" },
  { value: "AUTRE", label: "Autre" },
] as const;

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "💵 Espèces" },
  { value: "MOBILE_MONEY", label: "📱 Mobile Money" },
  { value: "BANK_TRANSFER", label: "🏦 Virement bancaire" },
  { value: "CARD", label: "💳 Carte" },
  { value: "CHEQUE", label: "📄 Chèque" },
];

const schema = z.object({
  studentSearch: z.string().optional(),
  invoiceId: z.string().optional(),
  motif: z.string().min(1, "Motif requis"),
  month: z.coerce.number().optional(),
  year: z.coerce.number().optional(),
  amount: z.coerce.number().positive("Montant requis"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]),
  note: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface StudentPaymentModalProps {
  open: boolean;
  onClose: () => void;
  cashSessionId: string;
}

export function StudentPaymentModal({ open, onClose, cashSessionId }: StudentPaymentModalProps) {
  const user = useAuthStore((s) => s.user);
  const schoolId = useEffectiveSchoolId();

  // Step management: "select-student" → "payment" → "receipt"
  const [step, setStep] = useState<"select-student" | "payment" | "receipt">("select-student");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);

  const { data: searchResults, isFetching: searching } = useStudentSearch(schoolId, searchQuery);
  const { data: pendingInvoices, isLoading: loadingInvoices } = useStudentPendingInvoices(
    selectedStudent?.id,
    schoolId
  );

  const recordQuickPayment = useRecordQuickPayment();

  const currentYr = new Date().getFullYear();
  const currentMo = new Date().getMonth() + 1;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: "CASH", motif: "", month: currentMo, year: currentYr },
  });

  const watchAmount = watch("amount");
  const watchMethod = watch("method");

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("select-student");
      setSearchQuery("");
      setSelectedStudent(null);
      setSelectedInvoice(null);
      setReceiptData(null);
      setLastPaymentId(null);
      reset({ method: "CASH", motif: "", month: currentMo, year: currentYr });
    }
  }, [open, reset, currentMo, currentYr]);

  // Pre-fill amount when invoice is selected
  useEffect(() => {
    if (selectedInvoice) {
      const paid = selectedInvoice.payments.reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
      const remaining = selectedInvoice.amount - selectedInvoice.discountAmount - paid;
      setValue("amount", remaining > 0 ? remaining : selectedInvoice.amount);
    }
  }, [selectedInvoice, setValue]);

  function selectStudent(student: Student) {
    setSelectedStudent(student);
    setSearchQuery("");
    setStep("payment");
  }

  function handleSelectInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
    const paid = invoice.payments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);
    const remaining = invoice.amount - invoice.discountAmount - paid;
    setValue("amount", remaining > 0 ? remaining : invoice.amount);
  }

  function handleClearInvoice() {
    setSelectedInvoice(null);
    setValue("amount", 0 as never);
  }

  async function onSubmit(values: FormValues) {
    if (!selectedStudent) return;

    const payment = await recordQuickPayment.mutateAsync({
      schoolId,
      studentId: selectedStudent.id,
      amount: values.amount,
      method: values.method as PaymentMethod,
      motif: values.motif,
      month: values.month,
      year: values.year,
      note: values.note,
      invoiceId: selectedInvoice?.id,
    });

    setLastPaymentId(payment.id);

    setReceiptData({
      receiptNo: payment.receiptNo,
      schoolName: "E-Sekooly",
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      studentRegistrationNo: selectedStudent.registrationNo,
      className: selectedStudent.classRoom?.name,
      feeName: values.motif,
      amount: selectedInvoice ? selectedInvoice.amount : values.amount,
      amountPaid: values.amount,
      balance: Math.max(0, (selectedInvoice ? selectedInvoice.amount : values.amount) - values.amount),
      method: values.method,
      paidAt: new Date().toISOString(),
      cashierName: `${user?.firstName} ${user?.lastName}`,
    });

    setStep("receipt");
  }

  const modalTitle =
    step === "select-student"
      ? "💳 Paiement — Sélectionner l'élève"
      : step === "payment"
      ? `Paiement — ${selectedStudent?.firstName} ${selectedStudent?.lastName}`
      : "Reçu de paiement";

  return (
    <Modal open={open} onClose={onClose} title={modalTitle}>
      {/* ──────────── STEP 1: Search student ──────────── */}
      {step === "select-student" && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder="Rechercher par nom, matricule…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
            />
            {searching && (
              <span className="absolute right-3 top-3 text-xs text-slate-400">Recherche…</span>
            )}
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 dark:border-ink-700">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-sky-50 dark:border-ink-700 dark:hover:bg-ink-700"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
                    <User className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 dark:text-white">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-xs text-slate-400">
                      {student.registrationNo}
                      {student.classRoom && ` · ${student.classRoom.name}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && (searchResults?.length ?? 0) === 0 && (
            <p className="text-center text-sm text-slate-400">Aucun élève trouvé.</p>
          )}

          {searchQuery.length < 2 && (
            <p className="text-center text-sm text-slate-400">
              Saisissez au moins 2 caractères pour rechercher.
            </p>
          )}

          <div className="mt-2 flex justify-end">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      )}


      {/* ──────────── STEP 2: Payment form ──────────── */}
      {step === "payment" && selectedStudent && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Student summary */}
          <div className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 dark:bg-sky-900/20">
            <User className="h-5 w-5 text-sky-500" />
            <div className="flex-1">
              <div className="font-medium text-slate-800 dark:text-white">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </div>
              <div className="text-xs text-slate-500">
                {selectedStudent.registrationNo}
                {selectedStudent.classRoom && ` · ${selectedStudent.classRoom.name}`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep("select-student")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Factures en attente (optionnel) */}
          {(pendingInvoices?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Lier à une facture en attente (optionnel)
              </label>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 dark:border-ink-700">
                {selectedInvoice && (
                  <div className="flex items-center justify-between border-b border-slate-50 bg-sky-50 px-4 py-2 dark:border-ink-700 dark:bg-sky-900/20">
                    <div>
                      <div className="text-sm font-medium text-slate-800 dark:text-white">
                        {selectedInvoice.feeCategory.name}
                      </div>
                      <div className="text-xs text-slate-400">{selectedInvoice.invoiceNo}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearInvoice}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {!selectedInvoice && pendingInvoices?.map((inv) => {
                  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
                  const remaining = inv.amount - inv.discountAmount - paid;
                  return (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => handleSelectInvoice(inv)}
                      className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-2.5 text-left last:border-0 hover:bg-sky-50 dark:border-ink-700 dark:hover:bg-ink-700"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-white">
                          {inv.feeCategory.name}
                        </div>
                        <div className="text-xs text-slate-400">{inv.invoiceNo}</div>
                      </div>
                      <div className="text-right text-sm font-bold text-amber-600">
                        {formatCurrency(remaining)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motif du paiement */}
          <Input
            label="Motif du paiement *"
            placeholder="Ex: Frais de scolarité, Cantine, Transport…"
            error={errors.motif?.message}
            {...register("motif")}
          />

          {/* Mois et Année concernés */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Mois concerné
              </label>
              <select
                {...register("month")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                {[
                  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
                ].map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Année
              </label>
              <select
                {...register("year")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
              >
                {[currentYr - 1, currentYr, currentYr + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <Input
            label="Montant à encaisser (Ar) *"
            type="number"
            step="0.01"
            error={errors.amount?.message}
            {...register("amount")}
          />

          {/* Payment method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Mode de paiement *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setValue("method", m.value)}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
                    watchMethod === m.value
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-900/30 dark:text-sky-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note supplémentaire */}
          <Input label="Note supplémentaire (optionnel)" {...register("note")} />

          {/* Summary */}
          {watchAmount > 0 && (
            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Montant à encaisser:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(Number(watchAmount))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">Mode:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {PAYMENT_METHODS.find((m) => m.value === watchMethod)?.label}
                </span>
              </div>
            </div>
          )}

          {recordQuickPayment.isError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
              {(recordQuickPayment.error as any)?.response?.data?.message ||
                "Une erreur est survenue lors de l'enregistrement du paiement."}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("select-student")}
              disabled={isSubmitting}
            >
              Retour
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              💳 Encaisser &amp; Générer le reçu
            </Button>
          </div>
        </form>
      )}

      {/* ──────────── STEP 3: Receipt ──────────── */}
      {step === "receipt" && receiptData && (
        <ReceiptTicket
          data={receiptData}
          onClose={() => {
            onClose();
          }}
          onNewPayment={() => {
            // Le reçu reste comme modèle : on revient à la sélection d'élève
            // sans perdre le reçu affiché. Un nouveau paiement génère un
            // nouveau reçu mais le modèle (template) reste accessible.
            setStep("select-student");
          }}
          onDownloadPdf={
            lastPaymentId ? () => downloadReceiptPdf(lastPaymentId) : undefined
          }
        />
      )}
    </Modal>
  );
}
