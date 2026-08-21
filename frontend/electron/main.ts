import { app, BrowserWindow, dialog } from "electron";
import * as path from "path";
import { readFileSync } from "fs";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function loadBackendEnv() {
  try {
    const envPath = path.join(process.resourcesPath, "backend", ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
    console.log("Variables d'environnement backend chargées depuis:", envPath);
  } catch (error) {
    console.error("Impossible de charger le .env du backend:", error);
  }
}

function ensureBundledDatabase() {
  const dbPath = path.join(process.resourcesPath, "backend", "dev.db");
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${dbPath}`;
    console.log("Base de données backend forcée vers:", dbPath);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "e-sekooly",
    width: 1280,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription) => {
    console.error("Échec du chargement de la fenêtre:", errorCode, errorDescription);
    dialog.showErrorBox("Erreur de chargement", `Code: ${errorCode}\n${errorDescription}`);
  });

  mainWindow.once("ready-to-show", () => {
    console.log("Fenêtre prête à être affichée");
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const htmlPath = path.join(__dirname, "../dist/index.html");
    console.log("Chargement du fichier:", htmlPath);
    mainWindow.loadFile(htmlPath).then(() => {
      console.log("Fichier chargé avec succès");
      mainWindow?.show();
    }).catch((err) => {
      console.error("Erreur loadFile:", err);
      dialog.showErrorBox("Erreur de chargement", err.message);
    });
    return;
  }

  mainWindow.show();
}

async function startBackend() {
  if (isDev) return;

  try {
    loadBackendEnv();
    ensureBundledDatabase();
    const backendPath = path.join(process.resourcesPath, "backend", "dist", "app.js");
    console.log("Démarrage backend intégré:", backendPath);
    const { createApp } = await import(backendPath);
    const appExpress = createApp();
    const port = 4000;

    await new Promise<void>((resolve, reject) => {
      const server = appExpress.listen(port, () => resolve());
      server.on("error", reject);
    });

    console.log(`Backend intégré démarré sur http://localhost:${port}`);
  } catch (error) {
    console.error("Erreur démarrage backend intégré:", error);
  }
}

app.whenReady().then(async () => {
  console.log("Application prête, isDev:", isDev);
  await startBackend();
  console.log("Création de la fenêtre...");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (error) => {
  console.error("Exception non gérée:", error);
});
