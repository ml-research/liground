import path from 'path'

export default {
  stockfish: path.resolve(__static, `./bin/stockfish${process.platform === 'win32' ? '.exe' : ''}`)
}
