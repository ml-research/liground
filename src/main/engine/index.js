import { spawn } from 'child_process'
import { ipcMain } from 'electron'
import Engines from './engines'
import EngineDriver from './driver'

/** @type {EngineDriver} */
let engine = null

const listeners = {
  input: null,
  line: null,
  info: null
}

// eslint-disable-next-line prefer-const
let binary = Engines.stockfish

ipcMain.on('run', async event => {
  event.reply('debug', 'Running engine')

  // kill old engine
  if (engine) {
    event.reply('debug', 'Killing...')

    // remove listeners
    for (const [event, listener] of Object.entries(listeners)) {
      engine.events.off(event, listener)
    }

    // quit engine
    await engine.quit()
    event.reply('debug', 'Killed!')
  }

  // spawn engine process
  const child = spawn(binary, []).on('error', err => event.reply('error', err))

  // success
  if (typeof child.pid === 'number') {
    // create engine
    engine = new EngineDriver(child.stdin, child.stdout)

    // setup listeners
    listeners.input = line => event.reply('engine-input', line)
    listeners.line = line => event.reply('engine-output', line)
    listeners.info = info => event.reply('engine-info', info)

    // register listeners
    for (const [event, listener] of Object.entries(listeners)) {
      engine.events.on(event, listener)
    }

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
