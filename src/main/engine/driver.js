import readline from 'readline'
import EventEmitter from 'events'

/**
 * Class to control engine process.
 */
export default class EngineDriver extends EventEmitter {
  /**
   * Create a new EngineDriver for a running child process.
   * @param {import('child_process').ChildProcess} child Engine child process
   */
  constructor (child) {
    super()
    this.ready = false
    this.pendingReady = false
    this.process = child
    this.rl = readline.createInterface({
      input: child.stdout,
      output: child.stdin
    })

    // update state on ready
    this.on('ready', () => {
      this.ready = true
      this.pendingReady = false
    })

    // parse output lines
    this.rl.on('line', line => this._parseLine(line))

    // initial ready check
    this._write('isready')
  }

  /**
   * Internally used to write a command directly to the engine.
   * @param {string} cmd Command to send to the engine
   */
  _write (cmd) {
    this.process.stdin.write(`${cmd}\n`)
  }

  /**
   * Internally used to parse UCI lines and emit events.
   * @param {string} line UCI line
   */
  _parseLine (line) {
    line = line.trim()
    if (line === 'readyok') {
      this.emit('ready')
    } else if (line.startsWith('option')) {
      this.emit('option', line)
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
        this.once('ready', resolve)
        if (!this.pendingReady) {
          this.pendingReady = true
          this._write('isready')
        }
      }
    })
  }

  /**
   * Queue a new UCI command to be executed once the engine is ready.
   * @param {string} cmd UCI command
   */
  async queue (cmd) {
    await this.waitForReady()
    this.ready = false
    this._write(cmd)
  }
}
