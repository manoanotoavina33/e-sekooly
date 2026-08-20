import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { useUsers, useRoles, useCreateUser, useUpdateUser, useDeleteUser, type Role, type User } from "../hooks/useUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search, Plus, Pencil, Trash2, X, UserCheck, UserX } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("E-mail invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères").optional().or(z.literal("")),
  roleIds: z.array(z.string().uuid()).min(1, "Au moins un rôle requis"),
  isActive: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export function UsersManagementPanel() {
  const schoolId = useEffectiveSchoolId();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const { data: users, isLoading } = useUsers(schoolId, search);
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", roleIds: [], isActive: true },
  });

  const watchedRoleIds = watch("roleIds");

  function openCreate() {
    setEditingUser(null);
    reset({ firstName: "", lastName: "", email: "", password: "", roleIds: [], isActive: true });
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditingUser(u);
    const roleIds = u.roles.map((r) => r.role.id);
    reset({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: "",
      roleIds: roleIds,
      isActive: u.isActive,
    });
    setModalOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (editingUser) {
      const payload: any = { id: editingUser.id, ...values };
      if (!payload.password) delete payload.password;
      await updateUser.mutateAsync(payload);
    } else {
      if (!values.password) {
        alert("Le mot de passe est requis pour un nouvel utilisateur.");
        return;
      }
      await createUser.mutateAsync({ schoolId, ...values });
    }
    setModalOpen(false);
  }

  async function handleDelete() {
    if (deleteConfirm) {
      await deleteUser.mutateAsync(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white">Utilisateurs de l'établissement</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gestion des comptes et rôles. Accessible uniquement aux admins.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </Button>
      </Card>

      <Card className="overflow-x-auto p-0">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 dark:border-ink-700">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, e-mail…"
              className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-800 dark:text-white"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-ink-700">
              <th className="px-5 py-3 font-medium">Nom</th>
              <th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Rôles</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Chargement…</td></tr>
            )}
            {!isLoading && (users?.length ?? 0) === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Aucun utilisateur trouvé.</td></tr>
            )}
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-ink-700">
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span key={r.role.id} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        {r.role.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {u.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <UserCheck className="h-3 w-3" /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                      <UserX className="h-3 w-3" /> Inactif
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-ink-700">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-ink-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" error={errors.firstName?.message} {...register("firstName")} />
            <Input label="Nom" error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <Input label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
          <Input
            label={editingUser ? "Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            type="text"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Rôles *</label>
            <div className="flex flex-wrap gap-2">
              {roles?.map((role) => {
                const checked = watchedRoleIds.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      if (checked) {
                        setValue("roleIds", watchedRoleIds.filter((id) => id !== role.id));
                      } else {
                        setValue("roleIds", [...watchedRoleIds, role.id]);
                      }
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                      checked
                        ? "border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-900/30 dark:text-sky-300"
                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300"
                    }`}
                  >
                    {role.label}
                  </button>
                );
              })}
            </div>
            {errors.roleIds && <p className="text-xs text-red-600">{errors.roleIds.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input id="isActive" type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
            <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-200">Compte actif</label>
          </div>

          {createUser.isError && <p className="text-xs text-red-600">{(createUser.error as any)?.response?.data?.message || "Erreur lors de la création."}</p>}
          {updateUser.isError && <p className="text-xs text-red-600">{(updateUser.error as any)?.response?.data?.message || "Erreur lors de la mise à jour."}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting}>{editingUser ? "Enregistrer" : "Créer"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} title="Confirmer la suppression">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer l'utilisateur <strong>{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong> ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleteUser.isPending}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
