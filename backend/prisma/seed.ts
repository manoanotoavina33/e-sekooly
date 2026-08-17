import { PrismaClient, RoleName, SchoolType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLES: { name: RoleName; label: string }[] = [
  { name: "SUPER_ADMIN", label: "Super Administrateur" },
  { name: "ADMIN", label: "Administrateur" },
  { name: "DIRECTOR", label: "Directeur" },
  { name: "SECRETARY", label: "Secrétaire" },
  { name: "ACCOUNTANT", label: "Comptable" },
  { name: "TEACHER", label: "Enseignant" },
  { name: "SUPERVISOR", label: "Surveillant" },
  { name: "PARENT", label: "Parent" },
  { name: "STUDENT", label: "Élève" },
];

// Permissions de base pour le Module 1. Les modules suivants ajouteront
// leurs propres permissions (ex: "students.create", "finance.invoices.read").
const BASE_PERMISSIONS = [
  { code: "dashboard.view", module: "dashboard" },
  { code: "users.manage", module: "users" },
  { code: "settings.manage", module: "settings" },
  // Module 2 : Élèves
  { code: "students.read", module: "students" },
  { code: "students.create", module: "students" },
  { code: "students.update", module: "students" },
  { code: "students.discipline", module: "students" },
  // Module 3 : Enseignants & RH
  { code: "hr.read", module: "hr" },
  { code: "hr.manage", module: "hr" },
  { code: "finance.read", module: "finance" },
  { code: "finance.manage", module: "finance" },
  // Module 4 : Classes, Matières & Emploi du temps
  { code: "academics.read", module: "academics" },
  { code: "academics.manage", module: "academics" },
  // Module 5 : Présence
  { code: "attendance.read", module: "attendance" },
  { code: "attendance.record", module: "attendance" },
  // Module 6 : Examens, Notes & Bulletins
  { code: "exams.read", module: "exams" },
  { code: "exams.manage", module: "exams" },
  { code: "grades.read", module: "grades" },
  { code: "grades.record", module: "grades" },
  // Module 7 : Discipline & Communication
  { code: "discipline.read", module: "discipline" },
  { code: "discipline.record", module: "discipline" },
  { code: "communication.manage", module: "communication" },
  // Module 9 : Caisse
  { code: "cashier.read", module: "cashier" },
  { code: "cashier.operate", module: "cashier" },
  { code: "cashier.validate", module: "cashier" },
  { code: "cashier.manage", module: "cashier" },
  // Module 10 : Comptabilité
  { code: "accounting.read", module: "accounting" },
  { code: "accounting.manage", module: "accounting" },
  // Module 13 : Rapports & exports
  { code: "reports.read", module: "reports" },
  // Module 14 : Paramètres avancés, Sauvegarde/Restauration, Sync
  { code: "settings.read", module: "settings" },
  { code: "sync.operate", module: "sync" },
];

const DEFAULT_SCHOOL_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name, label: role.label },
    });
  }

  for (const perm of BASE_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // Attribution des permissions "élèves" par rôle métier.
  const rolePermissionMap: Partial<Record<RoleName, string[]>> = {
    SUPER_ADMIN: BASE_PERMISSIONS.map((permission) => permission.code),
    ADMIN: [
      "students.read", "students.create", "students.update", "students.discipline",
      "hr.read", "hr.manage", "finance.read", "finance.manage",
      "academics.read", "academics.manage",
      "attendance.read", "attendance.record",
      "exams.read", "exams.manage", "grades.read", "grades.record",
      "discipline.read", "discipline.record", "communication.manage",
      "cashier.read", "cashier.operate", "cashier.validate", "cashier.manage",
      "accounting.read", "accounting.manage",
      "reports.read",
      "settings.read", "settings.manage", "sync.operate",
      "users.manage",
    ],
    DIRECTOR: [
      "students.read", "students.create", "students.update", "students.discipline",
      "hr.read", "hr.manage", "finance.read", "finance.manage",
      "academics.read", "academics.manage",
      "attendance.read", "attendance.record",
      "exams.read", "exams.manage", "grades.read", "grades.record",
      "discipline.read", "discipline.record", "communication.manage",
      "cashier.read", "cashier.validate",
      "accounting.read",
      "reports.read",
      "settings.read",
    ],
    SECRETARY: ["students.read", "students.create", "students.update", "hr.read", "academics.read", "attendance.read", "exams.read", "grades.read", "discipline.read", "communication.manage", "reports.read"],
    ACCOUNTANT: ["hr.read", "finance.read", "finance.manage", "academics.read", "cashier.read", "cashier.operate", "cashier.validate", "cashier.manage", "accounting.read", "accounting.manage", "reports.read"],
    TEACHER: ["students.read", "hr.read", "academics.read", "attendance.read", "attendance.record", "exams.read", "exams.manage", "grades.read", "grades.record", "discipline.read", "discipline.record"],
    SUPERVISOR: ["students.read", "students.discipline", "academics.read", "attendance.read", "attendance.record", "exams.read", "discipline.read", "discipline.record"],
    STUDENT: ["dashboard.view", "students.read", "academics.read", "attendance.read", "exams.read", "grades.read"],
    PARENT: ["dashboard.view", "students.read", "academics.read", "attendance.read", "exams.read", "grades.read"],
  };

  for (const [roleName, permCodes] of Object.entries(rolePermissionMap)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName as RoleName } });
    for (const code of permCodes ?? []) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { code } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const school = await prisma.school.upsert({
    where: { id: DEFAULT_SCHOOL_ID },
    update: {},
    create: {
      id: DEFAULT_SCHOOL_ID,
      name: "e-sekooly",
      shortName: "e-sekooly",
      currency: "MGA",
      timezone: "Indian/Antananarivo",
    },
  });

  const SCHOOL_TYPES: { code: SchoolType; label: string }[] = [
    { code: "PRIMARY", label: "Primaires" },
    { code: "COLLEGE", label: "Collège" },
    { code: "LYCEE", label: "Lycée" },
    { code: "UNIVERSITE", label: "Université" },
  ];

  for (const type of SCHOOL_TYPES) {
    await prisma.schoolCategory.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }

  const categories = await prisma.schoolCategory.findMany();
  await prisma.schoolSchoolCategory.deleteMany({ where: { schoolId: school.id } });
  await prisma.schoolSchoolCategory.createMany({
    data: categories.map((cat) => ({ schoolId: school.id, schoolTypeId: cat.id })),
  });

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@e-sekooly.local" },
    update: { schoolId: school.id },
    create: {
      firstName: "Super",
      lastName: "Admin",
      email: "admin@e-sekooly.local",
      passwordHash,
      schoolId: school.id,
      roles: { create: [{ roleId: superAdminRole.id }] },
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id },
  });

  console.log("✅ Seed terminé.");
  console.log(`   Rôles créés : ${ROLES.length}`);
  console.log(`   Compte admin : ${admin.email} / mot de passe: ChangeMe123! (à changer immédiatement)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
