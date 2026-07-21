const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('graphicsGravityFile', {
  save: content => ipcRenderer.invoke('project:save', content),
  open: () => ipcRenderer.invoke('project:open'),
  onLoad: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('project:load', listener);
    return () => ipcRenderer.removeListener('project:load', listener);
  }
});
