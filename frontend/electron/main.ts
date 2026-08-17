import { app, BrowserWindow } from "electron";
import * as path from "path";

const isDev = process.env.NODE_ENV !== "production" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

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

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function startBackend() {
  if (isDev) return;

  try {
    const backendPath = path.join(process.resourcesPath, "backend", "dist", "app.js");
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
  await startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
