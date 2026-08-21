import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureDatabase() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw<any[]>`SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
    if (result.length > 0) {
      console.log("✅ Base de données déjà initialisée");
      return;
    }
    console.log("⚙️ Base de données vide, initialisation...");
  } catch (err) {
    console.log("⚙️ Initialisation de la base de données...");
  }

  try {
    const { execSync } = await import("child_process");
    execSync("npx prisma migrate deploy", {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    console.log("✅ Migrations appliquées");

    try {
      const seedPath = require("path").join(process.cwd(), "prisma", "seed.ts");
      execSync(`npx tsx ${seedPath}`, {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      console.log("✅ Seed exécuté");
    } catch (seedErr) {
      console.log("⚠️ Seed ignoré (données déjà présentes ou seed non applicable)");
    }
  } catch (migrateErr) {
    console.error("❌ Erreur lors de l'initialisation de la base:", migrateErr);
  }
}

const app = createApp();
const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: { origin: env.corsOrigin, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("join:school", (schoolId: string) => {
    socket.join(`school:${schoolId}`);
  });
});

ensureDatabase().then(() => {
  httpServer.listen(env.port, () => {
    console.log(`✅ e-sekooly API démarrée sur http://localhost:${env.port}`);
  });
}).catch((err) => {
  console.error("❌ Erreur critique au démarrage:", err);
  process.exit(1);
});
