// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  selectDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  createDir: (dirPath) => ipcRenderer.invoke('fs:createDir', dirPath),
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', { filePath, content }),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath)
});