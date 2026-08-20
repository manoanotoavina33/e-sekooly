const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;

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

app.whenReady().then(async () => {
  backendLog('App ready, création fenêtre...');
  createWindow();

  try {
    await waitForBackend('http://localhost:4000/api/health', 2000);
    backendLog('Backend déjà en cours d\'exécution');
    console.log('Backend déjà en cours d\'exécution');
  } catch (err) {
    backendLog('Backend non disponible, attente de démarrage manuel...');
    console.log('Backend non disponible, attente de démarrage manuel...');
  }

  const isPackaged = app.isPackaged;
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
    app.quit();
  }
});
