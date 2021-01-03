import readline from 'readline'
import { EventEmitter } from 'events'

/**
   * Helper function to wait for an event.
   * @param {EventEmitter} emitter event emitter
   * @param {string} event event name
   * @returns {Promise<any[]>}
   */
function waitFor (emitter, event) {
  return new Promise(resolve => emitter.once(event, (...args) => resolve(args)))
}

/**
 * Class to control engine process.
 */
export default class EngineDriver {
  /**
   * Create a new EngineDriver for a running child process.
   * @param {import('child_process').ChildProcess} child Engine child process
   */
  constructor (child) {
    this.events = new EventEmitter()
    this.ready = false
    this.pendingReady = false
    this.info = {
      name: 'Unknown',
      author: 'Unknown',
      options: []
    }
    this.process = child
    this.rl = readline.createInterface({
      input: child.stdout,
      output: child.stdin
    })

    // update state on ready
    this.events.on('ready', () => {
      this.ready = true
      this.pendingReady = false
    })

    // parse output lines
    this.rl.on('line', line => this._parseLine(line))
  }

  /**
   * Used internally to write a command directly to the engine.
   * @param {string} cmd Command to send to the engine
   */
  _write (cmd) {
    const input = `${cmd}\n`
    this.events.emit('input', input)
    this.process.stdin.write(input)
  }

  /**
   * Used internally to parse UCI lines and emit events.
   * @param {string} line UCI line
   */
  _parseLine (line) {
    this.events.emit('line', line)
    line = line.trim()
    switch (line.split(/\s/)[0].trim()) {
      case 'uciok':
        this.events.emit('initialized')
        break
      case 'readyok':
        this.events.emit('ready')
        break
      case 'id':
        this.events.emit('id', line)
        break
      case 'option':
        this.events.emit('option', line)
        break
    }
  }

  /**
   * Wait until the engine is ready for the next command.
   * This will cause an "isready" if no ready check is pending already.
   * @returns {Promise<void>}
   */
  waitForReady () {
    return new Promise(resolve => {
      if (this.ready) {
        resolve()
      } else {
        this.events.once('ready', () => resolve())
        if (!this.pendingReady) {
          this.pendingReady = true
          this._write('isready')
        }
      }
    })
  }

  /**
   * Execute a UCI command.
   * If the command is not known it will be executed after a ready check.
   * @param {string} cmd UCI command
   * @returns {Promise<void>}
   */
  async exec (cmd) {
    cmd = cmd.trim()
    switch (cmd.split(/\s/)[0].trim()) {
      case 'uci':
        return await this.initialize()
      case 'quit':
        return await this.quit()
      default:
        await this.waitForReady()
        this.ready = false
        this._write(cmd)
    }
  }

  /**
   * Initialize the UCI communication with the engine process.
   */
  async initialize () {
    // add listeners
    const onId = line => {
      const [, type, value] = line.match(/^id\s+(.+?)\s(.+)$/)
      switch (type) {
        case 'name':
        case 'author':
          this.info[type] = value
          break
      }
    }
    const onOption = line => {
      const option = {}
      const regexp = /\s+(name|type|default|var|min|max)\s+(.+?)(?=\s+(?:name|type|default|var|min|max)|$)/g
      for (const [, name, value] of line.matchAll(regexp)) {
        if (name === 'var') {
          if (!option.var) {
            option.var = []
          }
          option.var.push(value)
        } else {
          option[name] = value
        }
      }
      this.info.options.push(option)
    }
    this.events.on('id', onId)
    this.events.on('option', onOption)

    // send "uci" to engine
    this._write('uci')

    // wait until done
    await waitFor(this.events, 'initialized')

    // remove listeners
    this.events.off('id', onId)
    this.events.off('option', onOption)

    // peform ready check
    await this.waitForReady()
  }

  /**
   * Tell the engine process to quit.
   */
  async quit () {
    await this.waitForReady()
    this._write('quit')
    await waitFor(this.process, 'close')
  }
}
