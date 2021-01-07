import { spawn } from 'child_process'
import { ipcMain } from 'electron'
import Engines from './engines'
import EngineDriver from './driver'

/** @type {EngineDriver} */
let engine = null

// eslint-disable-next-line prefer-const
let binary = Engines.stockfish

ipcMain.on('run', async event => {
  event.reply('debug', 'Running engine')

  // kill old engine
  if (engine) {
    await engine.quit()
  }

  // spawn engine process
  const child = spawn(binary, []).on('error', err => event.reply('error', err))

  // success
  if (typeof child.pid === 'number') {
    // create engine
    engine = new EngineDriver(child.stdin, child.stdout)
    engine.events.on('input', line => event.reply('engine-input', line))
    engine.events.on('line', line => event.reply('engine-output', line))
    engine.events.on('info', info => event.reply('engine-info', info))

    // initialize
    await engine.initialize()

    // reply with engine infos
    event.reply('active', engine.info)
  }
})

ipcMain.on('cmd', (event, cmd) => {
  cmd = cmd.trim()
  event.reply('debug', `Received command "${cmd}"`)
  if (engine) {
    engine.exec(cmd).catch(err => event.reply('error', err))
  } else {
    event.reply('error', 'Engine not running')
  }
})
