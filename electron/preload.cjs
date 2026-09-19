const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStorage: (key) => ipcRenderer.invoke('storage:get', key),
  setStorage: (key, data) => ipcRenderer.invoke('storage:set', key, data),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isDesktop: true,
});
