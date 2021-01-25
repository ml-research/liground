import { spawn } from 'child_process'
import Engines from './engines'
import EngineDriver from './driver'

/** @type {import('child_process').ChildProcess} */
let child = null

/** @type {EngineDriver} */
let engine = null

const listeners = {
  input: null,
  line: null,
  info: null
}

/**
 * Send a message to the parent
 * @param {string} type message type
 * @param  {...any} payload message payload
 */
function send (type, ...payload) {
  self.postMessage({
    payload: payload.length > 1 ? payload : payload[0],
    type
  })
}

async function run (engineId) {
  send('debug', 'Running engine')

  // kill old engine
  if (engine) {
    send('debug', 'Killing...')

    // remove listeners
    child.removeAllListeners('exit')
    for (const [event, listener] of Object.entries(listeners)) {
      engine.events.off(event, listener)
    }

    // quit engine
    await engine.quit()
    engine = null
    send('debug', 'Killed!')
  }

  // spawn engine process
  const binary = Engines[engineId]
  if (!binary) {
    send('error', `Could not find engine binary for "${engineId}"`)
    return
  }
  child = spawn(binary, []).on('error', err => send('error', err.message))

  // success
  if (typeof child.pid === 'number') {
    // create engine
    engine = new EngineDriver(child.stdin, child.stdout)

    // setup error logging & crash handling
    child.stderr.on('data', err => send('error', err.toString().trim()))
    child.on('exit', () => send('crash'))

    // setup listeners
    listeners.input = line => send('input', line)
    listeners.line = line => send('output', line)
    listeners.info = info => send('info', info)

    // register listeners
    for (const [event, listener] of Object.entries(listeners)) {
      engine.events.on(event, listener)
    }

    // initialize
    await engine.initialize()

    send('debug', 'Engine active:', engine.info)

    // reply with engine infos
    send('active', engine.info)
  }
}

function exec (cmd) {
  cmd = cmd.trim()
  send('debug', `Received command "${cmd}"`)
  if (engine) {
    engine.exec(cmd).catch(err => send('error', err.message))
  } else {
    send('error', 'Engine not running')
  }
}

self.addEventListener('message', ({ data: { type, payload } }) => {
  switch (type) {
    case 'run':
      run(payload)
      break
    case 'cmd':
      exec(payload)
      break
  }
})
