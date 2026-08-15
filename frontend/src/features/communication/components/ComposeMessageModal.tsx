import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useEmployees } from "@/features/teachers/hooks/useEmployees";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSendMessage } from "../hooks/useMessages";

const schema = z.object({
  subject: z.string().min(1, "Objet requis"),
  body: z.string().min(1, "Message requis"),
  recipientIds: z.array(z.string().uuid()).min(1, "Sélectionnez au moins un destinataire"),
});
type FormValues = z.infer<typeof schema>;

export function ComposeMessageModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const { data: employeesData } = useEmployees({ schoolId, pageSize: 100 });
  const sendMessage = useSendMessage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { recipientIds: [] } });

  async function onSubmit(values: FormValues) {
    await sendMessage.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau message">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Destinataires</label>
          <select
            multiple
            className="h-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("recipientIds")}
          >
            {employeesData?.data.map((e) => (
              <option key={e.id} value={e.id}>{e.user.firstName} {e.user.lastName}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400">Maintenez Ctrl / Cmd pour sélectionner plusieurs destinataires.</p>
          {errors.recipientIds && <span className="text-xs font-medium text-red-500">{errors.recipientIds.message}</span>}
        </div>

        <Input label="Objet" error={errors.subject?.message} {...register("subject")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Message</label>
          <textarea
            rows={5}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("body")}
          />
          {errors.body && <span className="text-xs font-medium text-red-500">{errors.body.message}</span>}
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Envoyer</Button>
        </div>
      </form>
    </Modal>
  );
}
