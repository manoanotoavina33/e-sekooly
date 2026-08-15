import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ClassRoom, useCreateClassRoom, useUpdateClassRoom } from "../hooks/useClassRooms";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  level: z.string().min(1, "Niveau requis"),
  track: z.string().optional(),
  section: z.string().optional(),
  room: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
});
type FormValues = z.infer<typeof schema>;

export function ClassRoomFormModal({
  open,
  onClose,
  schoolId,
  classRoom,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  classRoom?: ClassRoom | null;
}) {
  const createClassRoom = useCreateClassRoom();
  const updateClassRoom = useUpdateClassRoom();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { capacity: 40 } });

  useEffect(() => {
    if (!open) return;
    reset({
      name: classRoom?.name ?? "",
      level: classRoom?.level ?? "",
      track: classRoom?.track ?? "",
      section: classRoom?.section ?? "",
      room: classRoom?.room ?? "",
      capacity: classRoom?.capacity ?? 40,
    });
  }, [classRoom, open, reset]);

  async function onSubmit(values: FormValues) {
    if (classRoom) {
      await updateClassRoom.mutateAsync({ id: classRoom.id, payload: values });
    } else {
      await createClassRoom.mutateAsync({ ...values, schoolId });
    }
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer une classe">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom de la classe" placeholder="6ème A" error={errors.name?.message} {...register("name")} />
          <Input label="Niveau" placeholder="6ème" error={errors.level?.message} {...register("level")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Filière" placeholder="Scientifique" {...register("track")} />
          <Input label="Section" placeholder="A" {...register("section")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Salle" placeholder="Salle 12" {...register("room")} />
          <Input label="Effectif max" type="number" error={errors.capacity?.message} {...register("capacity")} />
        </div>

        {createClassRoom.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue. Ce nom de classe existe peut-être déjà.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Créer la classe
          </Button>
        </div>
      </form>
    </Modal>
  );
}
