// Test script to simulate Electron renderer login flow
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.webContents.on('did-finish-load', async () => {
    console.log('[TEST] Page loaded, testing login...');

    // Test the login flow by executing JavaScript in the renderer
    try {
      const result = await mainWindow.webContents.executeJavaScript(`
        (async () => {
          try {
            const response = await fetch('http://localhost:4000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ email: 'admin@e-sekooly.local', password: 'ChangeMe123!' }),
            });
            const data = await response.json();
            return {
              status: response.status,
              ok: response.ok,
              hasAccessToken: !!(data.data && data.data.accessToken),
              tokenLength: data.data && data.data.accessToken ? data.data.accessToken.length : 0,
              user: data.data && data.data.user ? data.data.user.email : null,
              roles: data.data && data.data.user ? data.data.user.roles : null,
              error: data.message || null,
            };
          } catch (err) {
            return { error: err.message, networkError: true };
          }
        })()
      `);
      console.log('[TEST] Login result:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[TEST] Error:', err.message);
    }

    // Also test with axios-like request (using XMLHttpRequest)
    try {
      const xhrResult = await mainWindow.webContents.executeJavaScript(`
        (async () => {
          return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://localhost:4000/api/auth/login', true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.withCredentials = true;
            xhr.onload = () => {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve({
                  status: xhr.status,
                  hasAccessToken: !!(data.data && data.data.accessToken),
                  tokenLength: data.data && data.data.accessToken ? data.data.accessToken.length : 0,
                  error: data.message || null,
                });
              } catch (e) {
                resolve({ status: xhr.status, parseError: true, raw: xhr.responseText.substring(0, 200) });
              }
            };
            xhr.onerror = () => {
              resolve({ networkError: true, status: xhr.status });
            };
            xhr.send(JSON.stringify({ email: 'admin@e-sekooly.local', password: 'ChangeMe123!' }));
          });
        })()
      `);
      console.log('[TEST] XHR Login result:', JSON.stringify(xhrResult, null, 2));
    } catch (err) {
      console.error('[TEST] XHR Error:', err.message);
    }

    // Check cookies
    try {
      const cookies = await mainWindow.webContents.session.cookies.get({ url: 'http://localhost:4000' });
      console.log('[TEST] Cookies after login:', JSON.stringify(cookies.map(c => ({ name: c.name, hasValue: !!c.value, secure: c.secure })), null, 2));
    } catch (err) {
      console.error('[TEST] Cookie error:', err.message);
    }

    // Close after test
    setTimeout(() => {
      console.log('[TEST] Test complete, closing...');
      app.quit();
    }, 2000);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('[TEST] Page load failed:', errorCode, errorDescription);
  });

  // Load from file:// to simulate PACKAGED Electron mode
  const htmlPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  console.log('[TEST] Loading from:', htmlPath);
  mainWindow.loadFile(htmlPath);
}

app.whenReady().then(() => {
  console.log('[TEST] App ready');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Timeout safety
setTimeout(() => {
  console.log('[TEST] Timeout, forcing quit');
  app.quit();
}, 30000);
