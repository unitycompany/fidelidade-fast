# Electron Setup - App Desktop

## 1. Instalar Electron
```bash
npm install --save-dev electron electron-builder
```

## 2. Arquivo principal do Electron
```javascript
// public/electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'src/assets/icon.png')
  });

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

## 3. Scripts no package.json
```json
{
  "main": "public/electron.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "ELECTRON_IS_DEV=true electron .",
    "build:electron": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --publish=never"
  },
  "build": {
    "appId": "com.fast.fidelidade",
    "productName": "Fast Fidelidade",
    "directories": {
      "output": "dist_electron"
    },
    "files": [
      "dist/**/*",
      "public/electron.js",
      "node_modules/**/*"
    ],
    "win": {
      "icon": "src/assets/icon.png",
      "target": "nsis"
    },
    "mac": {
      "icon": "src/assets/icon.png"
    }
  }
}
```

## 4. Executar:
```bash
# Desenvolvimento
npm run electron-dev

# Build
npm run build:electron
```
