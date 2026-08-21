"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const env_1 = require("./config/env");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function ensureDatabase() {
    try {
        await prisma.$connect();
        const result = await prisma.$queryRaw `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`;
        if (result.length > 0) {
            console.log("✅ Base de données déjà initialisée");
            return;
        }
        console.log("⚙️ Base de données vide, initialisation...");
    }
    catch (err) {
        console.log("⚙️ Initialisation de la base de données...");
    }
    try {
        const { execSync } = await Promise.resolve().then(() => __importStar(require("child_process")));
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
        }
        catch (seedErr) {
            console.log("⚠️ Seed ignoré (données déjà présentes ou seed non applicable)");
        }
    }
    catch (migrateErr) {
        console.error("❌ Erreur lors de l'initialisation de la base:", migrateErr);
    }
}
const app = (0, app_1.createApp)();
const httpServer = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(httpServer, {
    cors: { origin: env_1.env.corsOrigin, credentials: true },
});
exports.io.on("connection", (socket) => {
    socket.on("join:school", (schoolId) => {
        socket.join(`school:${schoolId}`);
    });
});
ensureDatabase().then(() => {
    const server = httpServer.listen(env_1.env.port, () => {
        console.log(`✅ e-sekooly API démarrée sur http://localhost:${env_1.env.port}`);
    });
    server.on("error", (err) => {
        console.error("❌ Erreur lors du démarrage du serveur:", err.message);
        process.exit(1);
    });
}).catch((err) => {
    console.error("❌ Erreur critique au démarrage:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map