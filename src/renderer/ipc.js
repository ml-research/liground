import { ipcRenderer } from 'electron'

ipcRenderer.on('debug', (_, ...args) => {
  console.log('[IPC] Debug:', ...args)
})

ipcRenderer.on('error', (_, ...args) => {
  console.log('[IPC] Error:', ...args)
})

export default {
  runEngine () {
    return new Promise((resolve, reject) => {
      function onError (_, err) {
        ipcRenderer.removeListener('active', onSuccess)
        reject(new Error(err))
      }
      function onSuccess (_, response) {
        ipcRenderer.removeListener('error', onError)
        resolve(response)
      }
      ipcRenderer.once('error', onError)
      ipcRenderer.once('active', onSuccess)
      ipcRenderer.send('run')
    })
  },
  send (cmd) {
    ipcRenderer.send('cmd', cmd)
  },
  on (event, callback) {
    ipcRenderer.on(`engine-${event}`, (_, ...args) => callback(...args))
  }
}
