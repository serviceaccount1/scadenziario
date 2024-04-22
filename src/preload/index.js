import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  fetchRefs:()=>electronAPI.ipcRenderer.invoke("refs"),
  showNotification:(title,body)=>electronAPI.ipcRenderer.send("showNotification",{title,body}),
  showDialog:msg =>electronAPI.ipcRenderer.send("showDialog",msg),
  showErrorDialog:msg =>electronAPI.ipcRenderer.send("showErrorDialog",msg),
  addRef:payload=>electronAPI.ipcRenderer.invoke("addRef",payload),
  remRef:id=>electronAPI.ipcRenderer.invoke("remRef",id),
  openFile:path=>electronAPI.ipcRenderer.send("openFile",path),
  notificaTutto:notifiche=>electronAPI.ipcRenderer.invoke("notificaTutto",JSON.stringify(notifiche))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
