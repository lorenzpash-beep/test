const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  uploadFiles: (paths) => ipcRenderer.invoke('upload-files', paths),
  generatePDF: (data) => ipcRenderer.invoke('generate-pdf', data),
  getCreations: () => ipcRenderer.invoke('get-creations'),
  deleteCreation: (id) => ipcRenderer.invoke('delete-creation', id),
  openPDF: (url) => ipcRenderer.invoke('open-pdf', url)
});
