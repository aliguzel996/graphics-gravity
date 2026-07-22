const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

app.setAppUserModelId('co.ycswu.graphicsgravity');

let mainWindow;
let currentProjectPath = null;
let pendingProjectPath = process.argv.find(argument => argument.toLowerCase().endsWith('.graphicsgravity')) || null;

function projectPathFromArgs(args) {
  return args.find(argument => typeof argument === 'string' && argument.toLowerCase().endsWith('.graphicsgravity')) || null;
}

async function sendProjectToWindow(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    currentProjectPath = filePath;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitle(`${path.basename(filePath)} — Graphics Gravity`);
      mainWindow.webContents.send('project:load', { name: path.basename(filePath), content });
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else pendingProjectPath = filePath;
  } catch (error) {
    dialog.showErrorBox('Graphics Gravity', `Project could not be opened.\n\n${error.message}`);
  }
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();
else app.on('second-instance', (_event, commandLine) => {
  const filePath = projectPathFromArgs(commandLine);
  if (filePath) sendProjectToWindow(filePath);
  else if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.show(); mainWindow.focus(); }
});

ipcMain.handle('project:save', async (_event, content) => {
  if (!currentProjectPath) {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'graphics-gravity-project.graphicsGravity',
      filters: [{ name: 'Graphics Gravity Project', extensions: ['graphicsGravity'] }]
    });
    if (result.canceled || !result.filePath) return { canceled: true };
    currentProjectPath = result.filePath;
  }
  await fs.writeFile(currentProjectPath, content, 'utf8');
  mainWindow?.setTitle(`${path.basename(currentProjectPath)} — Graphics Gravity`);
  return { canceled: false, name: path.basename(currentProjectPath) };
});

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Graphics Gravity Project', extensions: ['graphicsGravity'] }]
  });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  currentProjectPath = result.filePaths[0];
  mainWindow?.setTitle(`${path.basename(currentProjectPath)} — Graphics Gravity`);
  return { canceled: false, name: path.basename(currentProjectPath), content: await fs.readFile(currentProjectPath, 'utf8') };
});

const exportTypes = {
  png: { name: 'PNG Image', extensions: ['png'] },
  jpg: { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
  jpeg: { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
  svg: { name: 'SVG Image', extensions: ['svg'] },
  webm: { name: 'WebM Video', extensions: ['webm'] },
  zip: { name: 'ZIP Archive', extensions: ['zip'] }
};

ipcMain.handle('export:save', async (event, payload = {}) => {
  const suggestedName = path.basename(typeof payload.name === 'string' && payload.name.trim() ? payload.name : 'graphics-gravity-export');
  const extension = path.extname(suggestedName).slice(1).toLowerCase();
  const bytes = payload.bytes;
  const data = Buffer.isBuffer(bytes)
    ? bytes
    : bytes instanceof ArrayBuffer
      ? Buffer.from(bytes)
      : ArrayBuffer.isView(bytes)
        ? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength)
        : null;
  if (!data) throw new TypeError('Export data is invalid.');

  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  const result = await dialog.showSaveDialog(owner, {
    defaultPath: path.join(app.getPath('downloads'), suggestedName),
    filters: exportTypes[extension] ? [exportTypes[extension]] : undefined
  });
  if (result.canceled || !result.filePath) return { canceled: true };

  try {
    await fs.writeFile(result.filePath, data);
    return { canceled: false, name: path.basename(result.filePath), path: result.filePath, size: data.byteLength };
  } catch (error) {
    await dialog.showMessageBox(owner, {
      type: 'error',
      title: 'Graphics Gravity',
      message: 'The export could not be saved.',
      detail: error.message
    });
    return { canceled: true, error: error.message };
  }
});

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: '#f4f4f1',
    icon: path.join(__dirname, '..', 'assets', 'graphics-gravity.ico'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.cjs') }
  });
  mainWindow.webContents.once('did-finish-load', () => {
    if (pendingProjectPath) { const filePath = pendingProjectPath; pendingProjectPath = null; sendProjectToWindow(filePath); }
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
});

app.on('open-file', (event, filePath) => { event.preventDefault(); if (app.isReady()) sendProjectToWindow(filePath); else pendingProjectPath = filePath; });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
