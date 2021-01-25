/**
 * Class handling worker updates
 */
export default class Sender {
  /**
   * Create a new Sender with the desired frequency
   * @param {number} freq update frequency
   */
  constructor (freq) {
    this.queued = []
    setInterval(() => {
      if (this.queued.length > 0) {
        self.postMessage(this.queued)
        this.queued = []
      }
    }, freq)
  }

  /**
   * Send an error message to the parent, bypassing the queue.
   * @param  {...string} msgs messages payload
   */
  debug (...msgs) {
    self.postMessage([{
      payload: msgs,
      type: 'debug'
    }])
  }

  /**
   * Send a debug message to the parent, bypassing the queue.
   * @param  {...string} msgs messages payload
   */
  error (...msgs) {
    self.postMessage([{
      payload: msgs,
      type: 'error'
    }])
  }

  /**
   * Enqueue a new message.
   * @param {string} type message type
   * @param {any} payload message payload
   */
  queue (type, payload) {
    this.queued.push({ type, payload })
  }
}
