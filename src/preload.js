const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    startProfile: (profileId) => ipcRenderer.send('start-profile', profileId)
});
