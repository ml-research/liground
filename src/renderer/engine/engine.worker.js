import { spawn } from 'child_process'
import Engines from './engines'
import EngineDriver from './driver'
import Sender from './sender'

// TODO: only save last update of overriding updates
// create sender with 50ms interval
const msg = new Sender(50)

/** @type {import('child_process').ChildProcess} */
let child = null

/** @type {EngineDriver} */
let engine = null

async function run (engineId) {
  msg.debug('Running engine')

  // kill old engine
  if (engine) {
    msg.debug('Killing...')

    // remove listeners
    child.removeAllListeners('exit')
    engine.events.removeAllListeners('input')
    engine.events.removeAllListeners('output')
    engine.events.removeAllListeners('info')

    // quit engine
    await engine.quit()
    engine = null
    msg.debug('Killed!')
  }

  // spawn engine process
  const binary = Engines[engineId]
  if (!binary) {
    msg.error(`Could not find engine binary for "${engineId}"`)
    return
  }
  child = spawn(binary, []).on('error', err => msg.error(err.message))

  // success
  if (typeof child.pid === 'number') {
    // create engine
    engine = new EngineDriver(child.stdin, child.stdout)

    // setup error logging & crash handling
    child.stderr.on('data', err => msg.error(err.toString().trim()))
    child.on('exit', () => msg.queue('crash'))

    // TODO: setup listeners
    engine.events.on('input', data => msg.queue('input', data))
    engine.events.on('line', data => msg.queue('output', data))
    engine.events.on('info', info => msg.queue('info', info))

    // initialize
    await engine.initialize()

    msg.debug('Engine active:', engine.info)

    // reply with engine infos
    msg.queue('active', engine.info)
  }
}

function exec (cmd) {
  cmd = cmd.trim()
  msg.debug(`Received command "${cmd}"`)
  if (engine) {
    engine.exec(cmd).catch(err => msg.error(err.message))
  } else {
    msg.error('Engine not running')
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
