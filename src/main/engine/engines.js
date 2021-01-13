import path from 'path'

/**
 * Resolve the path to an engine binary
 * @param {string} name binary file name
 */
function resolveBinary (name) {
  return path.resolve(
    process.env.NODE_ENV !== 'development' ? __static.replace('app.asar', 'app.asar.unpacked') : __static,
    'bin',
    name
  )
}

export default {
  get stockfish () {
    return resolveBinary(`stockfish${process.platform === 'win32' ? '.exe' : ''}`)
  }
}
