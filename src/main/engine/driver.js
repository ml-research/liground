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
   * Create a new EngineDriver for two existing input & output streams.
   * @param {NodeJS.WritableStream} input Writable engine input stream
   * @param {NodeJS.ReadableStream} output Readable engine output stream
   * @example <caption>Creating new EngineDriver for a child process.</caption>
   * const child = spawn('./engine', [])
   * const engine = new EngineDriver(child.stdin, child.stdout)
   * engine.initialize().then(() => console.log('Engine online!'))
   */
  constructor (input, output) {
    this.events = new EventEmitter()
    this.ready = false
    this.pendingReady = false
    this.info = {
      name: 'Unknown',
      author: 'Unknown',
      options: []
    }
    this.input = input
    this.output = output
    this.rl = readline.createInterface({
      input: output,
      output: input
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
    this.input.write(input)
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
      case 'id': {
        const [, type, value] = line.match(/^id\s+(.+?)\s(.+)$/)
        if (type === 'name' || type === 'author') {
          this.info[type] = value
        }
        this.events.emit('id', { [type]: value })
        break
      }
      case 'option': {
        const option = {}
        const regexp = /\s+(name|type|default|var|min|max)\s+(.+?)(?=\s+(?:name|type|default|var|min|max)|\s*$)/g
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
        if (option.type === 'spin') {
          for (const key of ['default', 'min', 'max']) {
            if (key in option) {
              option[key] = parseInt(option[key])
            }
          }
        }
        this.info.options.push(option)
        this.events.emit('option', option)
        break
      }
      case 'info': {
        const info = {}
        const regexp = /\s+(depth|seldepth|multipv|cp|nodes|nps|hashfull|tbhits|time|pv)\s+(.+?)(?=\s+(?:depth|seldepth|multipv|score|nodes|nps|hashfull|tbhits|time|pv)|\s*$)/g
        for (const [, type, value] of line.matchAll(regexp)) {
          info[type] = type.match(/depth|seldepth|multipv|cp|nodes|nps|hashfull|tbhits|time/) ? parseInt(value) : value
        }
        this.events.emit('info', info)
        break
      }
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
   */
  async exec (cmd) {
    cmd = cmd.trim()
    switch (cmd.split(/\s/)[0].trim()) {
      case 'uci':
        return await this.initialize()
      case 'quit':
        return await this.quit()
      case 'setoption':
      case 'position':
      case 'go':
        this._write(cmd)
        break
      default:
        this.ready = false
        this._write(cmd)
        await this.waitForReady()
    }
  }

  /**
   * Initialize the UCI communication with the engine.
   */
  async initialize () {
    // send "uci" to engine
    this._write('uci')

    // wait until done
    await waitFor(this.events, 'initialized')

    // peform ready check
    await this.waitForReady()
  }

  /**
   * Tell the engine to quit.
   */
  async quit () {
    await this.waitForReady()
    this._write('quit')
    await waitFor(this.input, 'close')
  }

  /**
   * Set an engine option.
   * @param {string} name Name of the option
   * @param {any} [value=null] Value to set
   */
  async setOption (name, value = null) {
    this._write(`setoption name ${name} ${value !== null ? `value ${value}` : ''}`)
  }

  /**
   * Set the engine position
   * @param {string} [fen = null] Position in FEN notation
   */
  async position (fen = null) {
    this._write(`position ${fen || ''}`)
  }

  /**
   * Start the engine in infinite mode.
   */
  async goInfinite () {
    this._write('go infinite')
  }
}
