import { EventEmitter } from 'events'
import EngineWorker from './engine.worker.js'

class Engine extends EventEmitter {
  constructor (...args) {
    super(...args)

    /** @type {Worker} */
    this.worker = new EngineWorker()

    // create global listener to emit events based on received messages
    this.worker.addEventListener('message', ({ data }) => {
      for (const { type, payload } of data) {
        this.emit(type, ...(Array.isArray(payload) ? payload : [payload]))
      }
    })
  }

  run (binary) {
    return new Promise(resolve => {
      this.once('active', info => resolve(info))
      this.worker.postMessage({
        payload: binary,
        type: 'run'
      })
    })
  }

  send (cmd) {
    this.worker.postMessage({
      payload: cmd,
      type: 'cmd'
    })
  }
}

export default new Engine()
