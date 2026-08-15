import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { CashSessionDetail, useCloseCashSession } from "../hooks/useCashSessions";

const schema = z.object({ declaredClosingBalance: z.coerce.number().nonnegative() });
type FormValues = z.infer<typeof schema>;

export function CloseSessionModal({
  open,
  onClose,
  session,
}: {
  open: boolean;
  onClose: () => void;
  session: CashSessionDetail;
}) {
  const closeSession = useCloseCashSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { declaredClosingBalance: session.expectedBalance } });

  async function onSubmit(values: FormValues) {
    await closeSession.mutateAsync({ id: session.id, ...values });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Fermer la caisse">
      <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-sky-50 p-3 text-center text-sm dark:bg-ink-700">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Entrées</p>
          <p className="font-bold text-emerald-600">+{formatCurrency(session.totalIn)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sorties</p>
          <p className="font-bold text-red-500">-{formatCurrency(session.totalOut)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Solde attendu</p>
          <p className="font-bold text-sky-700 dark:text-sky-300">{formatCurrency(session.expectedBalance)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Solde compté en caisse"
          type="number"
          step="0.01"
          error={errors.declaredClosingBalance?.message}
          {...register("declaredClosingBalance")}
        />
        <p className="text-xs text-slate-400">
          Un écart entre le solde compté et le solde attendu sera automatiquement calculé et enregistré.
        </p>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>Clôturer la caisse</Button>
        </div>
      </form>
    </Modal>
  );
}
