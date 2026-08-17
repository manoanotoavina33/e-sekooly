import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Employee, useCreateEmployee, useUpdateEmployee } from "../hooks/useEmployees";

const schema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  password: z.string().optional(),
  position: z.string().min(2, "Poste requis"),
  department: z.string().optional(),
  hireDate: z.string().min(1, "Date d'embauche requise"),
  degrees: z.string().optional(),
  isTeacher: z.boolean(),
  isActive: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function EmployeeFormModal({
  open,
  onClose,
  schoolId,
  employee,
  suggestedPositions,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  employee?: Employee | null;
  suggestedPositions?: string[];
}) {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const isEditing = Boolean(employee);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { isTeacher: true } });

  useEffect(() => {
    if (!open) return;
    if (employee) {
      const hireDateFormatted = employee.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "";
      reset({
        firstName: employee.user.firstName,
        lastName: employee.user.lastName,
        email: employee.user.email,
        position: employee.position,
        department: employee.department ?? "",
        hireDate: hireDateFormatted,
        degrees: employee.degrees ?? "",
        isTeacher: true,
        isActive: employee.isActive,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        position: "",
        department: "",
        hireDate: "",
        degrees: "",
        isTeacher: true,
        isActive: true,
      });
    }
  }, [employee, open, reset]);

  async function onSubmit(values: FormValues) {
    if (isEditing && employee) {
      await updateEmployee.mutateAsync({
        id: employee.id,
        payload: {
          position: values.position,
          department: values.department ? values.department : undefined,
          hireDate: values.hireDate,
          degrees: values.degrees ? values.degrees : undefined,
          isActive: values.isActive,
        },
      });
    } else {
      await createEmployee.mutateAsync({
        ...values,
        password: values.password || "Password123!",
        schoolId,
      });
    }
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Modifier l'employé ${employee?.user.firstName} ${employee?.user.lastName}` : "Recruter un employé"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {!isEditing && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prénom" error={errors.firstName?.message} {...register("firstName")} />
              <Input label="Nom" error={errors.lastName?.message} {...register("lastName")} />
            </div>

            <Input label="E-mail (compte de connexion)" type="email" error={errors.email?.message} {...register("email")} />
            <Input label="Mot de passe temporaire" type="password" error={errors.password?.message} {...register("password")} />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Input label="Poste" placeholder="Enseignant de Mathématiques" error={errors.position?.message} {...register("position")} list="position-suggestions" />
            {suggestedPositions && suggestedPositions.length > 0 && (
              <datalist id="position-suggestions">
                {suggestedPositions.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            )}
          </div>
          <Input label="Département" placeholder="Pédagogique" {...register("department")} />
        </div>

        <Input label="Date d'embauche" type="date" error={errors.hireDate?.message} {...register("hireDate")} />
        <Input label="Diplômes" placeholder="Master en Mathématiques (2019)" {...register("degrees")} />

        {isEditing && (
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500" {...register("isActive")} />
            Compte actif
          </label>
        )}

        {!isEditing && (
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-sky-500" {...register("isTeacher")} />
            Ce poste est un enseignant (donne accès aux classes et matières)
          </label>
        )}

        {!isEditing && (
          <p className="text-xs text-slate-400">
            Le matricule employé est généré automatiquement (ex: EMP-2026-000001).
          </p>
        )}

        {(createEmployee.isError || updateEmployee.isError) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue lors de l'enregistrement.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Enregistrer les modifications" : "Recruter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
