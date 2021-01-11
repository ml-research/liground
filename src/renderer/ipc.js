import { ipcRenderer, remote } from 'electron'

ipcRenderer.on('debug', (_, ...args) => {
  console.log('%c[IPC] Debug:', 'color: #82aaff; font-weight: 700;', ...args)
})

ipcRenderer.on('error', (_, ...args) => {
  console.error('%c[IPC]', 'color: #82aaff; font-weight: 700;', ...args)
})

function runEngine () {
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
}

ipcRenderer.on('engine-crash', async () => {
  const { response } = await remote.dialog.showMessageBox({
    type: 'error',
    title: 'LiGround: Engine crash',
    message: 'The engine has crashed.',
    detail: 'If you are a developer, you may find additional information in the developer console.',
    buttons: ['Cancel', 'Open Console', 'Restart Engine']
  })
  switch (response) {
    case 1:
      remote.getCurrentWindow().openDevTools()
      break
    case 2:
      await runEngine()
      break
  }
})

export default {
  runEngine,
  send (cmd) {
    ipcRenderer.send('cmd', cmd)
  },
  on (event, callback) {
    ipcRenderer.on(`engine-${event}`, (_, ...args) => callback(...args))
  }
}
