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
    this.mainWorker = new EngineWorker()

    // create global listener to emit events based on received messages
    this.mainWorker.addEventListener('message', ({ data }) => {
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

    // second thread for evaluation only
    /** @type {Worker} */
    this.evalWorker = new EngineWorker()
    this.evalWorker.addEventListener('message', ({ data }) => {
      if (data.type !== 'cache') {
        this.emit(`eval-${data.type}`, ...arrayify(data.payload))
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
      this.mainWorker.postMessage({
        payload: { engineId, listeners: ['io', 'info'] },
        type: 'run'
      })
      this.evalWorker.postMessage({
        payload: { engineId, listeners: [], silent: true },
        type: 'run'
      })
    })
  }

  /**
   * Send an UCI command to the engine process.
   * @param {string} command UCI command
   */
  send (command) {
    this.mainWorker.postMessage({
      payload: command,
      type: 'cmd'
    })
    if (command.toLowerCase().includes('uci_variant')) {
      this.evalWorker.postMessage({
        payload: command,
        type: 'cmd'
      })
    }
  }

  /**
   * Evaluate a position.
   * @param {string} fen FEN position
   * @param {number} depth search depth
   * @returns {Promise<string>} score in cp or mate
   */
  evaluate (fen, depth) {
    return new Promise(resolve => {
      this.evalWorker.onmessage = ({ data }) => {
        if (data.type === 'cache') {
          for (const { type, payload } of data.events) {
            if (type === 'evaluated') {
              resolve(payload)
              delete this.evalWorker.onmessage
            }
          }
        }
      }
      this.evalWorker.postMessage({
        payload: { fen, depth },
        type: 'eval'
      })
    })
  }
}

export default new Engine()
