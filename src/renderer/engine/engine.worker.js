import path from 'path'
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
 * Resolve the path to an engine binary.
 * @param {string} name binary file name
 */
function resolveBinary (name) {
  return path.resolve(
    process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '../../../') : process.resourcesPath,
    'engines',
    `${name}${process.platform === 'win32' ? '.exe' : ''}`
  )
}

/**
 * Run a new engine, killing the old process.
 * @param {string} engineBinary binary to use
 */
async function run (engineBinary, listeners, silent) {
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
  const binary = resolveBinary(engineBinary)
  if (!binary) {
    msg.error(`Could not find engine binary for "${engineBinary}"`)
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
    for (const event of listeners) {
      if (event === 'io') {
        engine.events.on('input', data => msg.queue('io', `> ${data}`))
        engine.events.on('line', data => msg.queue('io', data))
      } else {
        engine.events.on(event, info => msg.queue(event, info))
      }
    }

    // initialize
    await engine.initialize()

    if (!silent) {
      msg.debug('Engine active:', engine.info)
    }

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

function evalPos (fen, depth) {
  msg.debug(`Evaluating "${fen}" with depth ${depth}`)
  if (engine) {
    let result = ''
    engine.exec(`position fen ${fen}`)
    const listener = info => {
      if ('cp' in info) {
        result = `${info.cp}`
      } else if ('mate' in info) {
        result = `#${info.mate}`
      }
    }
    engine.events.on('info', listener)
    engine.events.once('bestmove', () => {
      engine.events.off('info', listener)
      msg.debug(`Eval finished with result: ${result}`)
      msg.queue('evaluated', result)
    })
    engine.exec(`go depth ${depth}`)
  } else {
    msg.error('Engine not running')
  }
}

self.addEventListener('message', ({ data: { type, payload } }) => {
  switch (type) {
    case 'run':
      run(payload.engineId, payload.listeners || [], payload.silent)
      break
    case 'cmd':
      exec(payload)
      break
    case 'eval': {
      const { fen, depth } = payload
      evalPos(fen, depth)
      break
    }
  }
})
