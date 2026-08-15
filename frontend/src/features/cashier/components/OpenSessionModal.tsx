import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOpenCashSession } from "../hooks/useCashSessions";

const schema = z.object({ openingBalance: z.coerce.number().nonnegative() });
type FormValues = z.infer<typeof schema>;

export function OpenSessionModal({
  open,
  onClose,
  cashRegisterId,
}: {
  open: boolean;
  onClose: () => void;
  cashRegisterId: string;
}) {
  const openSession = useOpenCashSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { openingBalance: 0 } });

  async function onSubmit(values: FormValues) {
    await openSession.mutateAsync({ cashRegisterId, ...values });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Ouvrir la caisse">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Solde d'ouverture (fond de caisse)" type="number" step="0.01" error={errors.openingBalance?.message} {...register("openingBalance")} />

        {openSession.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une session est peut-être déjà ouverte pour cette caisse.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Ouvrir la caisse</Button>
        </div>
      </form>
    </Modal>
  );
}
