import { ipcRenderer, remote } from 'electron'

ipcRenderer.on('debug', (_, ...args) => {
  console.log('%c[IPC] Debug:', 'color: #82aaff; font-weight: 700;', ...args)
})

ipcRenderer.on('error', (_, ...args) => {
  console.error('%c[IPC]', 'color: #82aaff; font-weight: 700;', ...args)
})

let engine = 'stockfish'

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

/**
 * Start engine process of currently set engine.
 */
function runEngine () {
  return new Promise((resolve, reject) => {
    function onError (_, err) {
      ipcRenderer.removeListener('active', onSuccess)
      reject(err)
    }
    function onSuccess (_, response) {
      ipcRenderer.removeListener('error', onError)
      resolve(response)
    }
    ipcRenderer.once('error', onError)
    ipcRenderer.once('active', onSuccess)
    ipcRenderer.send('run', engine)
  })
}

/**
 * Set the engine & restart engine process if necessary.
 * @param {string} id Engine ID
 */
async function setBinary (id) {
  if (engine !== id) {
    engine = id
    await runEngine()
  }
}

/**
 * Send an UCI command to the engine.
 * @param {string} cmd UCI command
 */
function send (cmd) {
  ipcRenderer.send('cmd', cmd)
}

/**
 * Listen to an engine event.
 * @param {string} event event name
 * @param {function(...args): void} callback callback function
 */
function on (event, callback) {
  ipcRenderer.on(`engine-${event}`, (_, ...args) => callback(...args))
}

export default { runEngine, setBinary, send, on }
