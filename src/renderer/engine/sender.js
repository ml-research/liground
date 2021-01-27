/**
 * Class handling worker updates
 */
export default class EngineSender {
  /**
   * Create a new Sender with the desired frequency
   * @param {number} freq update frequency
   */
  constructor (freq) {
    // initialize cache
    this.resetCache()

    // setup update interval
    setInterval(() => {
      if (this.isDirty()) {
        self.postMessage(this.cache)
        this.resetCache()
      }
    }, freq)
  }

  /**
   * Reset the cache.
   */
  resetCache () {
    this.cache = {
      pv: [],
      io: [],
      info: {},
      events: [],
      type: 'cache'
    }
  }

  /**
   * Check if the cache contains updates.
   */
  isDirty () {
    const { pv, io, info, events } = this.cache
    return pv.length > 0 || io.length > 0 || Object.keys(info).length > 0 || events.length > 0
  }

  /**
   * Send an error message to the parent, bypassing the queue.
   * @param  {...string} msgs messages payload
   */
  debug (...msgs) {
    self.postMessage({
      payload: msgs,
      type: 'debug'
    })
  }

  /**
   * Send a debug message to the parent, bypassing the queue.
   * @param  {...string} msgs messages payload
   */
  error (...msgs) {
    self.postMessage({
      payload: msgs,
      type: 'error'
    })
  }

  /**
   * Enqueue a new message.
   * @param {string} type message type
   * @param {any} payload message payload
   */
  queue (type, payload) {
    switch (type) {
      case 'io':
        this.cache.io.push(payload)
        break
      case 'info':
        if ('multipv' in payload) {
          const line = {}
          for (const key of ['multipv', 'pv', 'cp', 'mate']) {
            line[key] = payload[key]
            delete payload[key]
          }
          this.cache.pv[line.multipv - 1] = line
        }
        Object.assign(this.cache.info, payload)
        break
      default:
        this.cache.events.push({ type, payload })
    }
  }
}
