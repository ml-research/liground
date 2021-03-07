import { EventEmitter } from 'events'
import EngineWorker from './engine.worker.js'

function arrayify (data) {
  return Array.isArray(data) ? data : [data]
}

/**
 * Class to handle communication with engine.
 * Emits `debug`, `error`, `io`, `info` events.
 */
class Engine extends EventEmitter {
  constructor (...args) {
    super(...args)

    /** @type {Worker} */
    this.worker = new EngineWorker()

    // create global listener to emit events based on received messages
    this.worker.addEventListener('message', ({ data }) => {
      if (data.type === 'cache') {
        const { pv, io, info, events } = data
        for (const line of pv) {
          if (line) {
            this.emit('info', line)
          }
        }
        if (Object.keys(info).length > 0) {
          this.emit('info', info)
        }
        if (io.length > 0) {
          this.emit('io', io)
        }
        for (const { type, payload } of events) {
          this.emit(type, ...arrayify(payload))
        }
      } else {
        this.emit(data.type, ...arrayify(data.payload))
      }
    })
  }

  /**
   * Start the engine process.
   * @param {string} engineId identifier of engine to run
   */
  run (engineId) {
    return new Promise(resolve => {
      this.once('active', info => resolve(info))
      this.worker.postMessage({
        payload: engineId,
        type: 'run'
      })
    })
  }

  /**
   * Send an UCI command to the engine process.
   * @param {string} command UCI command
   */
  send (command) {
    this.worker.postMessage({
      payload: command,
      type: 'cmd'
    })
  }
}

export default new Engine()
