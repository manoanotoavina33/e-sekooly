const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess = null;

function getBackendLogPath() {
  return path.join(app.getPath('userData'), 'backend-startup.log');
}

function backendLog(msg) {
  try {
    fs.appendFileSync(getBackendLogPath(), `[${new Date().toISOString()}] ${msg}\n`);
  } catch (e) {}
}

async function waitForBackend(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          scheduleRetry();
        }
      }).on('error', scheduleRetry);

      function scheduleRetry() {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Backend non disponible après ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      }
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'e-sekooly',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.show();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getBackendDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.join(__dirname, 'backend');
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const backendDir = getBackendDir();
    const serverPath = path.join(backendDir, 'dist', 'server.js');

    if (!fs.existsSync(serverPath)) {
      return reject(new Error(`Backend introuvable: ${serverPath}`));
    }

    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'e-sekooly.db');

    if (app.isPackaged && !fs.existsSync(dbPath)) {
      const bundledDb = path.join(process.resourcesPath, 'backend', 'dev.db');
      if (fs.existsSync(bundledDb)) {
        try {
          fs.copyFileSync(bundledDb, dbPath);
          backendLog('Base de données copiée vers userData');
        } catch (e) {
          backendLog('Erreur copie base de données: ' + e.message);
        }
      }
    }

    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '4000',
      DATABASE_URL: `file:${dbPath}`,
      JWT_ACCESS_SECRET: 'e-sekooly-offline-access-secret-change-me',
      JWT_REFRESH_SECRET: 'e-sekooly-offline-refresh-secret-change-me',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_DAYS: '30',
      CORS_ORIGIN: '*',
    };

    backendProcess = spawn('node', [serverPath], {
      cwd: backendDir,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log(`Backend: ${msg}`);
      backendLog('STDOUT: ' + msg.trim());
    });

    backendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      console.error(`Backend stderr: ${msg}`);
      backendLog('STDERR: ' + msg.trim());
    });

    backendProcess.on('error', (err) => {
      console.error('Erreur lancement backend:', err);
      backendLog('ERROR: ' + err.message);
      reject(err);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend arrêté (code ${code})`);
      backendLog(`EXIT: ${code}`);
    });

    waitForBackend('http://localhost:4000/api/health', 60000)
      .then(() => {
        backendLog('Backend prêt');
        resolve();
      })
      .catch(reject);
  });
}

function stopBackend() {
  if (backendProcess) {
    try {
      backendProcess.kill('SIGTERM');
    } catch (e) {}
    backendProcess = null;
  }
}

app.whenReady().then(async () => {
  backendLog('App ready, création fenêtre...');
  createWindow();

  const isPackaged = app.isPackaged;

  if (isPackaged) {
    try {
      backendLog('Démarrage du backend...');
      await startBackend();
      backendLog('Backend démarré avec succès');
      console.log('Backend démarré avec succès');
    } catch (err) {
      backendLog('Impossible de démarrer le backend: ' + err.message);
      console.error('Impossible de démarrer le backend:', err);
      dialog.showErrorBox('Erreur serveur', `Le serveur backend n'a pas pu démarrer.\n${err.message}`);
    }
  } else {
    try {
      await waitForBackend('http://localhost:4000/api/health', 2000);
      backendLog('Backend déjà en cours d\'exécution');
      console.log('Backend déjà en cours d\'exécution');
    } catch (err) {
      backendLog('Backend non disponible, attente de démarrage manuel...');
      console.log('Backend non disponible, attente de démarrage manuel...');
    }
  }

  if (isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Échec du chargement de la page:', errorCode, errorDescription, validatedURL);
    backendLog('FAIL-LOAD: ' + errorCode + ' ' + errorDescription + ' ' + validatedURL);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page chargée avec succès');
    backendLog('PAGE LOADED');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackend();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});
