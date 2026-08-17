import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { Student, useCreateStudent, useUpdateStudent } from "../hooks/useStudents";

const schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  classRoomId: z.string().optional().or(z.literal("")),
  placeOfBirth: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXCLUDED", "GRADUATED", "TRANSFERRED", "ARCHIVED"]).optional(),
});
type FormValues = z.infer<typeof schema>;

export function StudentFormModal({
  open,
  onClose,
  schoolId,
  student,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  student?: Student | null;
}) {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const { data: classRooms } = useClassRooms(schoolId);

  const isEditing = Boolean(student);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "MALE" },
  });

  useEffect(() => {
    if (student) {
      const dobFormatted = student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "";
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: dobFormatted,
        classRoomId: student.classRoom?.id ?? "",
        placeOfBirth: student.placeOfBirth ?? "",
        address: student.address ?? "",
        phone: student.phone ?? "",
        email: student.email ?? "",
        status: student.status,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        gender: "MALE",
        dateOfBirth: "",
        classRoomId: "",
        placeOfBirth: "",
        address: "",
        phone: "",
        email: "",
      });
    }
  }, [student, reset, open]);

  async function onSubmit(values: FormValues) {
    const classRoomId = values.classRoomId ? values.classRoomId : undefined;
    const { email, ...rest } = values;
    const emailValue = isEditing && email ? email : undefined;

    if (isEditing && student) {
      await updateStudent.mutateAsync({
        id: student.id,
        payload: { ...rest, classRoomId, email: emailValue },
      });
    } else {
      await createStudent.mutateAsync({ ...rest, classRoomId, schoolId });
    }
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Modifier l'élève ${student?.firstName} ${student?.lastName}` : "Inscrire un nouvel élève"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Nom" error={errors.lastName?.message} {...register("lastName")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Sexe</label>
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
              {...register("gender")}
            >
              <option value="MALE">Masculin</option>
              <option value="FEMALE">Féminin</option>
            </select>
          </div>
          <Input
            label="Date de naissance"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Classe</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("classRoomId")}
          >
            <option value="">Sélectionner une classe (Optionnel)</option>
            {classRooms?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>

        {isEditing && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Statut</label>
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
              {...register("status")}
            >
              <option value="ACTIVE">Actif</option>
              <option value="SUSPENDED">Suspendu</option>
              <option value="EXCLUDED">Exclu</option>
              <option value="GRADUATED">Diplômé</option>
              <option value="TRANSFERRED">Transféré</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
        )}

        <Input label="Lieu de naissance" {...register("placeOfBirth")} />
        <Input label="Adresse" {...register("address")} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Téléphone" {...register("phone")} />
          {isEditing && <Input label="E-mail" error={errors.email?.message} {...register("email")} />}
        </div>

        {!isEditing && (
          <p className="text-xs text-slate-400">
            Le matricule et le QR code seront générés automatiquement à la création. L'élève suivra tous les cours attribués à sa classe.
          </p>
        )}

        {(createStudent.isError || updateStudent.isError) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue lors de l'enregistrement.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Enregistrer les modifications" : "Inscrire l'élève"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
