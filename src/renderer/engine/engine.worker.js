import { spawn } from 'child_process'
import EngineDriver from './driver'
import EngineSender from './sender'

// create sender with 50ms interval
const msg = new EngineSender(50)

/** @type {import('child_process').ChildProcess} */
let child = null

/** @type {EngineDriver} */
let engine = null

/**
 * Run a new engine, killing the old process.
 * @param {string} binary binary to use
 */
async function run (binary) {
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
  if (!binary) {
    msg.error(`Could not find engine binary "${binary}"`)
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

    // setup listeners
    engine.events.on('input', data => msg.queue('io', `> ${data}`))
    engine.events.on('line', data => msg.queue('io', data))
    engine.events.on('info', info => msg.queue('info', info))

    // initialize
    await engine.initialize()

    msg.debug('Engine active:', engine.info)

    // reply with engine infos
    msg.queue('active', engine.info)
  }
}

/**
 * Execute a UCI command.
 * @param {string} cmd
 */
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
