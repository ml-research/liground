import path from 'path'

/**
 * Resolve the path to an engine binary
 * @param {string} name binary file name
 */
function resolveBinary (name) {
  return path.resolve(
    process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '../../../') : process.resourcesPath,
    'engines',
    `${name}${process.platform === 'win32' ? '.exe' : ''}`
  )
}

export default {
  get stockfish () {
    return resolveBinary('stockfish')
  }
}
