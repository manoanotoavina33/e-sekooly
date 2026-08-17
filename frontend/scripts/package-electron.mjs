import { execSync } from "child_process";
import { cpSync, mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "..");

function run(command, cwd) {
  console.log(`\n▶ ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
}

console.log("📦 Packaging e-sekooly Electron...");

run("npm run build:frontend", frontendRoot);
run("npm run build", resolve(frontendRoot, "..", "backend"));

console.log("\n✅ Fichiers prêts pour electron-builder.");
console.log("   Lancez 'npm run electron:build' pour générer l'exécutable.");
