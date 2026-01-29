'use strict'

import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import { createSchema, insertEval, getEval } from './evalCache'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow

// eslint-disable-next-line node/no-path-concat
const winURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9080' : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    // height: 563,
    useContentSize: true,
    // width: 1000,
    // fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      // allow access to Node globals
      contextIsolation: false
    }
  })

  mainWindow.maximize()
  mainWindow.loadURL(winURL)
  mainWindow.removeMenu()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
app.whenReady().then(() => {
  createSchema()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('eval-cache-get', async (_event, normalizedFen) => {
  try {
    const evaluation = getEval(normalizedFen)
    return evaluation
  } catch (err) {
    console.error('[eval-cache-get] failed', err)
  }
})

ipcMain.on('eval-cache-put', (_event, payload) => {
  try {
    insertEval(payload)
  } catch (err) {
    console.error('[eval-cache-put] failed', err)
  }
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const browserWindow = mainWindow || null
  try {
    const res = await dialog.showOpenDialog(browserWindow, options || {})
    return res
  } catch (err) {
    return { canceled: true, filePaths: [] }
  }
})

// Build and show a context menu requested from renderer. The renderer
// sends a simplified template (no functions) and we build native menu
// items whose click handlers forward a message back to the renderer.
ipcMain.handle('show-context-menu', async (event, template) => {
  try {
    if (!Array.isArray(template)) return false
    const menu = Menu.buildFromTemplate(template.map(item => {
      return {
        label: item.label,
        type: item.type,
        checked: item.checked,
        id: item.id,
        click: (menuItem, browserWindow, ev) => {
          try {
            const payload = { id: item.id, checked: menuItem.checked }
            if (mainWindow && mainWindow.webContents) {
              mainWindow.webContents.send('context-menu-command', payload)
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }))
    menu.popup({ window: mainWindow })
    return true
  } catch (err) {
    return false
  }
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
