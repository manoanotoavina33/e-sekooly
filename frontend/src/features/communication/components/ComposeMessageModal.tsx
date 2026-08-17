import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useEmployees } from "@/features/teachers/hooks/useEmployees";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSendMessage, useUpdateMessage } from "../hooks/useMessages";
import { cn } from "@/lib/utils";

const schema = z.object({
  subject: z.string().min(1, "Objet requis"),
  body: z.string().min(1, "Message requis"),
  recipientIds: z.array(z.string().uuid()).min(1, "Sélectionnez au moins un destinataire"),
});
type FormValues = z.infer<typeof schema>;

export function ComposeMessageModal({
  open,
  onClose,
  schoolId,
  message,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  message?: { id: string; subject: string; body: string; recipientIds: string[] } | null;
}) {
  const { data: employeesData } = useEmployees({ schoolId, pageSize: 100 });
  const sendMessage = useSendMessage();
  const updateMessage = useUpdateMessage();
  const isEditing = Boolean(message);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: message ?? { subject: "", body: "", recipientIds: [] },
  });

  const selectedIds = watch("recipientIds") || [];

  function toggleRecipient(id: string) {
    const current = selectedIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    setValue("recipientIds", next);
  }

  async function onSubmit(values: FormValues) {
    if (isEditing && message) {
      await updateMessage.mutateAsync({ id: message.id, ...values });
    } else {
      await sendMessage.mutateAsync({ ...values, schoolId });
    }
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Modifier le message" : "Nouveau message"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Destinataires</label>
          <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:bg-ink-800 dark:border-ink-700">
            {employeesData?.data.map((e) => {
              const isSelected = selectedIds.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => toggleRecipient(e.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-ink-700 dark:text-slate-300"
                  )}
                >
                  {e.user.firstName} {e.user.lastName}
                </button>
              );
            })}
          </div>
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
          <Button type="submit" isLoading={isSubmitting}>{isEditing ? "Enregistrer" : "Envoyer"}</Button>
        </div>
      </form>
    </Modal>
  );
}
