import { cn } from "@/lib/utils";
import { InvoiceStatus } from "../hooks/useInvoices";

const STYLES: Record<InvoiceStatus, string> = {
  PENDING: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  PARTIAL: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  PAID: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  OVERDUE: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  CANCELLED: "bg-slate-100 text-slate-400 line-through dark:bg-slate-800",
};

const LABELS: Record<InvoiceStatus, string> = {
  PENDING: "En attente",
  PARTIAL: "Partiel",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
