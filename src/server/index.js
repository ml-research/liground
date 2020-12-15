const os = require('os')
const WebSocket = require('ws')
const childProcess = require('child_process')
const readline = require('readline')
const ffish = require('ffish')
const path = require('path')

ffish['onRuntimeInitialized'] = () => {
  console.log(`ffish.info(): ${ffish.info()}`)
}

// TODO: Maybe get rid of WebSocket server all together and communicate with vuex-store directly
const wss = new WebSocket.Server({
  port: 8082
})

let cli = null
let ourWs = null

wss.on('connection', ws => {
  console.log('New client connected')
  ourWs = ws

  ws.on('message', data => {
    console.log(`Client has sent us: ${data}`)
    if (data.startsWith('startEngine')) {
      if (cli) {
        cli.closeEngine()
      }

      cli = new CLICreator(data.split('~')[1], data.split('~')[2])
      cli.startEngine()
    } else if (data.startsWith('goEngine')) {
      cli.goEngine()
    } else if (data.startsWith('stopEngine')) {
      cli.stopEngine()
    } else if (data.startsWith('position')) {
      console.log(`data: ${data}`)
      data = data.split('~')
      cli.wait()
      cli.reset()
      cli.setFEN(data[2])
      cli.buildMoveDestinations()
      cli.sendMoveDestinations()
      cli.isready()
    }
  })

  ws.on('close', () => {
    console.log('Client has disconnected')
  })
})

/*
Converts a string given uci pv line into a string of san move notation.
 -> [movesStr[0], sanPV]
*/
function extractPV (gameFEN, rawPV) {
  let movesStr = rawPV.split(' ')
  // TODO: Make this variant specific
  let board = new ffish.Board('crazyhouse', gameFEN)
  let sanPV = board.variationSan(rawPV)
  board.delete()

  return [movesStr[0], sanPV]
}

class CLICreator {
  constructor (engineBinary, variant) {
    this.destinations = {}
    this.idName = null
    this.idAuthor = null
    this.stdIO = []
    this.child = null
    this.multipv = [{
      depth: 0,
      seldepth: 0,
      cp: 0,
      mate: null,
      nodes: 0,
      nps: 0,
      hashfull: 0,
      tbhits: 0,
      time: 0,
      pv: '',
      ucimove: ''
    },
    {},
    {},
    {},
    {}
    ]
    this.curPVLines = 0
    this.update = false
    this.lastUpdate = undefined
    this.pv = ['', '', '', '', '']
    this.variant = variant
    this.engineBinary = engineBinary
    this.game = new ffish.Board('crazyhouse')
    this.child = null
    this.rl = null
    this.ready = true
  }
  wait () {
    this.ready = false
  }
  isready () {
    this.child.stdin.write('isready' + os.EOL)
  }
  stopEngine () {
    this.child.stdin.write('stop' + os.EOL)
  }
  setFEN (fen) {
    // this.game.load(fen);
    this.game.setFen(fen)
    this.pv = ['', '', '', '', '']
    this.multipv = [{
      depth: 0,
      seldepth: 0,
      cp: 0,
      mate: null,
      nodes: 0,
      nps: 0,
      hashfull: 0,
      tbhits: 0,
      time: 0,
      pv: '',
      ucimove: ''
    },
    {},
    {},
    {},
    {}
    ]
    this.child.stdin.write('position fen ' + fen + os.EOL)
    this.multipvIdx = -1 // current MultiPV idx
  }
  /*
  Build the move destinations which will be used in the GUI for legal moves.
  */
  buildMoveDestinations () {
    this.destinations = {}
    const legalMoves = this.game.legalMoves().split(' ')
    for (let idx = 0; idx < legalMoves.length; ++idx) {
      const uciMove = legalMoves[idx]
      // avoids dropping moves
      if (uciMove.length > 3) {
        const fromSq = uciMove.substring(0, 2)
        const toSq = uciMove.substring(2, 4)
        if (fromSq in this.destinations) {
          this.destinations[fromSq].push(toSq)
        } else {
          this.destinations[fromSq] = [toSq]
        }
      }
    }
  }
  /*
  Sends the move destinations via WebSocket.
  */
  sendMoveDestinations () {
    ourWs.send(JSON.stringify({
      destinations: this.destinations
    }))
  }
  /*
  Sends 'isready', 'go infinite' commands to the engine.
  */
  goEngine () {
    let message
    message = 'isready' + os.EOL
    this.child.stdin.write(message)
    message = 'go infinite' + os.EOL

    this.child.stdin.write(message)
    this.stdIO.push('>' + message)
  }
  /*
  Resets the current member variables.
  */
  reset () {
    this.update = false
    this.curPVLines = 0
    this.stdIO = []
  }
  /*
  Closes the active engine.
  */
  closeEngine () {
    this.child.stdin.write('close')
  }
  /*
  Starts the engine binary and parses the UCI replies.
  */
  startEngine () {
    console.log(`this.engineBinary: ${this.engineBinary}`)
    this.child = childProcess.exec(path.resolve(__dirname, 'engines', this.engineBinary), {
      cwd: path.resolve(__dirname, 'engines'),
      encoding: 'utf8'
    }, (error, stdout, stderr) => {
      console.error(`error: ${error}`)
    })

    this.child.stderr.on('data', data => {
      console.log(`[cli client] reported an error: ${data}`)
    })

    this.child.on('close', (code) => {
      console.log(`[cli client] process exited with code ${code}`)
      this.close(code, 'process exited')
    })

    this.rl = readline.createInterface({
      input: this.child.stdout,
      output: this.child.stdin
    })

    // parse a PV-line e.g.:
    // info depth 17 seldepth 27 multipv 1 score cp 60 nodes 1008782 nps 1007774 hashfull 468 tbhits 0 time 1001 pv e2e4 e7e5
    this.rl.on('line', (line) => {
      line = line.trim()

      if (line.startsWith('info ')) {
        let re = new RegExp('multipv (\\d+)')
        const match = re.exec(line)
        if (match) {
          this.curPVLines = Math.max(match[1], this.curPVLines)
          this.multipvIdx = match[1] - 1

          for (let key in this.multipv[0]) {
            re = new RegExp(key + ' (-?\\d+)')
            const match = re.exec(line)

            if (match) {
              this.multipv[this.multipvIdx][key] = match[1]
            }
          }

          // get pv line
          const idx = line.indexOf(' pv ')
          if (idx !== -1) {
            if (line.indexOf('bound') === -1) {
              this.pv[this.multipvIdx] = line.substring(idx + ' pv '.length)
              this.update = true
            }
          }
        }
      }

      this.stdIO.push('<' + line)
      if (line.startsWith('id name')) {
        this.idName = line.slice('id name'.length)
      }
      if (line.startsWith('id author')) {
        this.idAuthor = line.slice('id author'.length)
      }
      if (line === 'readyok') {
        this.ready = true
      }
      if (line === 'uciok') {
        ourWs.send(JSON.stringify({
          idName: this.idName,
          idAuthor: this.idAuthor,
          stdIO: this.stdIO
        }))
        this.stdIO = []
      }
      let deltaMS

      if (this.lastUpdate === undefined) {
        deltaMS = 10001
      } else {
        deltaMS = Date.now() - this.lastUpdate
      }
      if (((deltaMS > 200 && this.multipvIdx === 4) || this.multipv[0].mate || deltaMS > 2000) && this.update && this.ready) {
        this.lastUpdate = Date.now()

        for (let idx = 0; idx < this.curPVLines; ++idx) {
          [this.multipv[idx].ucimove, this.multipv[idx].pv] = extractPV(this.game.fen(), this.pv[idx])
        }
        ourWs.send(JSON.stringify({
          stdIO: this.stdIO,
          multipv: this.multipv
        }))
        this.reset()
      }
    })

    let message
    message = 'uci' + os.EOL
    this.child.stdin.write(message)
    message = 'setoption name UCI_AnalyseMode value true' + os.EOL
    this.child.stdin.write(message)
    message = 'setoption name UCI_Variant value ' + this.variant + os.EOL
    this.child.stdin.write(message)
    message = 'setoption name Analysis Contempt value Off' + os.EOL
    this.child.stdin.write(message)
    message = 'setoption name MultiPV value 5' + os.EOL
    this.child.stdin.write(message)
  }
}
