/**
 * Dev environment setup for Electron + Vue 2
 * Modernized for Electron ≥22 (no CRX extensions).
 */

import { app } from 'electron'
import debug from 'electron-debug'

// Enable electron-debug with devtools open
debug({ showDevTools: true })

// Optional: Try installing Vue Devtools (modern version)
import { installVueDevtools } from '@vue/devtools'

app.whenReady().then(async () => {
  try {
    await installVueDevtools()
    console.log('✅ Vue Devtools installed')
  } catch (err) {
    console.log('⚠️  Unable to install Vue Devtools:', err.message)
  }

  // Boot the main app
  require('./index')
})
