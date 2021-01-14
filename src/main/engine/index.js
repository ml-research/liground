import { spawn } from 'child_process'
import { ipcMain } from 'electron'
import Engines from './engines'
import EngineDriver from './driver'

/** Setup communication between renderer & engine. */
export default function setupEngineIPC () {
  /** @type {import('child_process').ChildProcess} */
  let child = null

  /** @type {EngineDriver} */
  let engine = null

  const listeners = {
    input: null,
    line: null,
    info: null
  }

  ipcMain.on('run', async (event, engineId) => {
    event.reply('debug', 'Running engine')

    // kill old engine
    if (engine) {
      event.reply('debug', 'Killing...')

      // remove listeners
      child.removeAllListeners('exit')
      for (const [event, listener] of Object.entries(listeners)) {
        engine.events.off(event, listener)
      }

      // quit engine
      await engine.quit()
      event.reply('debug', 'Killed!')
    }

    // spawn engine process
    const binary = Engines[engineId]
    if (!binary) {
      event.reply('error', new Error(`Could not find engine binary for "${engineId}"`))
      return
    }
    child = spawn(binary, []).on('error', err => event.reply('error', err))

    // success
    if (typeof child.pid === 'number') {
      // create engine
      engine = new EngineDriver(child.stdin, child.stdout)

      // setup error logging & crash handling
      child.stderr.on('data', err => event.reply('error', new Error(err.toString().trim())))
      child.on('exit', () => event.reply('engine-crash'))

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

      event.reply('debug', 'Engine active:', engine.info)

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
      event.reply('error', new Error('Engine not running'))
    }
  })
}
