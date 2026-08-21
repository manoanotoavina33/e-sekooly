import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:C:/Users/Don'Dada/AppData/Roaming/e-sekooly-desktop/e-sekooly.db"
    }
  }
});

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@e-sekooly.local" },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
    }
  });
  
  if (user) {
    console.log("USER FOUND IN ELECTRON DB:");
    console.log("  id:", user.id);
    console.log("  email:", user.email);
    console.log("  firstName:", user.firstName);
    console.log("  lastName:", user.lastName);
    console.log("  isActive:", user.isActive);
    console.log("  schoolId:", user.schoolId);
    console.log("  createdAt:", user.createdAt);
    console.log("  passwordHash length:", user.passwordHash.length);
    console.log("  passwordHash prefix:", user.passwordHash.substring(0, 20) + "...");
    console.log("  roles:", user.roles.map(r => r.role.name));
    
    const valid = await bcrypt.compare("ChangeMe123!", user.passwordHash);
    console.log("  password comparison:", valid);
  } else {
    console.log("USER NOT FOUND IN ELECTRON DB");
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
