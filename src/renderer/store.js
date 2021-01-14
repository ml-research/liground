import Vue from 'vue'
import Vuex from 'vuex'
import ffish from 'ffish'
import ipc from './ipc'

Vue.use(Vuex)

class TwoWayMap {
  constructor (map) {
    this.map = map
    this.reverseMap = {}
    this.keys = []
    for (const key in map) {
      const value = map[key]
      this.reverseMap[value] = key
      this.keys.concat(key)
    }
  }

  getAll () { return this.map }
  get (key) { return this.map[key] }
  revGet (key) { return this.reverseMap[key] }
}

/**
 * Calculate the value for current side to move.
 * @param {number} value CP or Mate value
 * @param {boolean} sideToMove Current side to move (true = white)
 */
function calcForSide (value, sideToMove) {
  return sideToMove ? value : -value
}

/**
 * Convert a CP value to a display string.
 * @param {number} cp CP value
 */
function cpToString (cp) {
  if (isNaN(cp)) {
    return ''
  }
  if (cp === 0) {
    return '±0.00'
  }
  const normalizedEval = (cp / 100).toFixed(2)
  if (cp > 0) {
    return `+${normalizedEval}`
  } else {
    return normalizedEval
  }
}

export const store = new Vuex.Store({
  state: {
    initialized: false,
    active: false,
    turn: true,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    lastFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // to track the end of the current line
    moves: [],
    legalMoves: '',
    destinations: {},
    variant: 'chess',
    variantOptions: new TwoWayMap({ // all the currently supported options are listed here, variantOptions.get returns the right side, variantOptions.revGet returns the left side of the dict
      '♟️ Standard': 'chess',
      '🏠 Crazyhouse': 'crazyhouse',
      '⛰️ King of the Hill': 'kingofthehill',
      '️Three-Check': '3check',
      Antichess: 'antichess',
      Horde: 'horde',
      '🏇 Racing Kings': 'racingkings'
    }),
    engineBinary: 'stockfish',
    stdIO: [],
    message: 'hello from Vuex',
    idName: '',
    idAuthor: '',
    orientation: 'white',
    engineStats: {
      depth: 0,
      seldepth: 0,
      nodes: 0,
      nps: 0,
      hashfull: 0,
      tbhits: 0,
      time: 0
    },
    multipv: [
      {
        cp: 0,
        pv: '',
        ucimove: ''
      }
    ],
    hoveredpv: -1,
    counter: 0,
    pieceStyle: 'merida',
    board: null,
    gameInfo: {},
    loadedGames: [],
    selectedGame: null
  },
  mutations: { // sync
    fen (state, payload) {
      state.fen = payload
    },
    lastFen (state, payload) {
      state.lastFen = payload
    },
    turn (state, payload) {
      state.turn = payload
    },
    legalMoves (state, payload) {
      state.legalMoves = payload
    },
    initialized (state, payload) {
      state.initialized = payload
    },
    orientation (state, payload) {
      state.orientation = payload
    },
    active (state, payload) {
      state.active = payload
    },
    destinations (state, payload) {
      state.destinations = payload
    },
    variant (state, payload) {
      state.variant = payload
    },
    engineBinary (state, payload) {
      state.engineBinary = payload
    },
    stdIO (state, payload) {
      state.stdIO = state.stdIO.concat(payload)
    },
    idName (state, payload) {
      state.idName = payload
    },
    idAuthor (state, payload) {
      state.idAuthor = payload
    },
    engineStats (state, payload) {
      state.engineStats = payload
    },
    multipv (state, payload) {
      for (const pvline of payload) {
        if (pvline.mate) {
          pvline.cpDisplay = `#${state.turn ? pvline.mate : -pvline.mate}`
        } else {
          pvline.cpDisplay = cpToString(calcForSide(pvline.cp, state.turn))
        }
      }
      state.multipv = payload
    },
    hoveredpv (state, payload) {
      state.hoveredpv = payload
    },
    increment (state, payload) {
      state.counter += payload
    },
    resetMultiPV (state) {
      state.multipv = [
        {
          cp: 0,
          pv: '',
          ucimove: ''
        }
      ]
    },
    pieceStyle (state, payload) {
      state.pieceStyle = payload
    },
    newBoard (state, payload) {
      if (typeof payload.fen === 'string') {
        if (payload.is960) {
          state.board = new ffish.Board(state.variant, payload.fen, true)
        } else {
          state.board = new ffish.Board(state.variant, payload.fen)
        }
      } else {
        state.board = new ffish.Board(state.variant)
      }
      state.moves = []
      state.gameInfo = {}
      this.commit('fen', state.board.fen())
      this.commit('turn', state.board.turn())
      this.commit('legalMoves', state.board.legalMoves())
      this.commit('lastFen', state.board.fen())
    },
    resetBoard (state, payload) {
      this.commit('newBoard', payload)
      state.moves = []
    },
    appendMoves (state, payload) {
      state.moves = state.moves.concat(payload.map((curVal, idx, arr) => {
        const sanMove = state.board.sanMove(curVal)
        state.board.push(curVal)
        return { ply: state.moves.length + idx + 1, name: sanMove, fen: state.board.fen(), uci: curVal, whitePocket: state.board.pocket(true), blackPocket: state.board.pocket(false) }
      }))
      state.lastFen = state.board.fen()
    },
    gameInfo (state, payload) {
      state.gameInfo = payload
    },
    loadedGames (state, payload) {
      state.loadedGames = payload
    },
    selectedGame (state, payload) {
      state.selectedGame = payload
    }
  },
  actions: { // async
    resetBoard (context, payload) {
      context.commit('resetMultiPV')
      context.commit('resetBoard', payload)
    },
    initialize (context) {
      context.commit('newBoard', {
        fen: '',
        is960: false
      })
      context.dispatch('updateBoard')
      context.commit('initialized', true)
    },
    updateBoard (context) {
      context.state.board.setFen(context.state.fen)
      context.commit('turn', context.state.board.turn())
      context.commit('legalMoves', context.state.board.legalMoves())
    },
    push (context, payload) {
      context.commit('appendMoves', payload.split(' '))
      context.dispatch('resetMultiPV')
      context.dispatch('updateBoard')
      context.dispatch('restartEngine')
    },
    goEngine (context) {
      ipc.send('go infinite')
      console.log('goEngine')
      context.commit('active', true)
    },
    stopEngine (context) {
      ipc.send('stop')
      console.log('stopEngine')
      context.commit('active', false)
    },
    restartEngine (context) {
      if (context.state.active) {
        context.dispatch('stopEngine')
        context.dispatch('position')
        context.dispatch('goEngine')
      }
    },
    resetMultiPV (context) {
      context.commit('resetMultiPV')
    },
    position (context) {
      ipc.send(`position fen ${context.getters.fen}`)
      context.commit('turn', context.getters.fen.split(' ')[1] === 'w')
      console.log(`state.sideToMove: ${context.turn ? 'white' : 'black'}`)
    },
    fen (context, payload) {
      context.commit('fen', payload)
      context.dispatch('updateBoard')
      context.dispatch('restartEngine')
    },
    lastFen (context, payload) {
      context.commit('lastFen', payload)
    },
    destinations (context, payload) {
      context.commit('destinations', payload)
    },
    orientation (context, payload) {
      context.commit('orientation', payload)
    },
    active (context, payload) {
      context.commit('active', payload)
    },
    variant (context, payload) {
      if (context.getters.variant !== payload) {
        if (context.getters.active) {
          context.dispatch('stopEngine')
        }
        context.commit('variant', payload)
        context.commit('newBoard', {})
        context.dispatch('resetMultiPV')
        ipc.send(`setoption name UCI_Variant value ${payload}`)
      }
    },
    set960 (context, payload) {
      if (context.getters.is960 !== payload) {
        context.commit('newBoard', {
          fen: context.getters.fen,
          is960: payload
        })
      }
    },
    engineBinary (context, payload) {
      context.commit('engineBinary', payload)
      ipc.setBinary(payload)
    },
    stdIO (context, payload) {
      context.commit('stdIO', payload)
    },
    idName (context, payload) {
      context.commit('idName', payload)
    },
    idAuthor (context, payload) {
      context.commit('idAuthor', payload)
    },
    updateMultiPV (context, payload) {
      // ignore pv updates when engine is expected to be inactive
      if (!context.state.active) {
        return
      }

      // update engine stats
      const stats = { ...context.state.engineStats }
      for (const key of Object.keys(stats)) {
        if (key in payload) {
          stats[key] = payload[key]
        }
      }
      context.commit('engineStats', stats)

      // update pvline
      const multipv = context.getters.multipv.slice(0)
      const pvline = {
        cp: payload.cp,
        mate: payload.mate,
        ucimove: payload.pv.split(/\s/)[0]
      }
      try {
        pvline.pv = context.state.board.variationSan(payload.pv)
      } catch (err) {
        console.error('Invalid move:', payload.pv)
      }
      multipv[payload.multipv - 1] = pvline
      context.commit('multipv', multipv)
    },
    loadedGames (context, payload) {
      context.commit('loadedGames', payload)
    },
    loadGame (context, payload) {
      let variant = payload.game.headers('Variant').toLowerCase()

      if (variant === '') { // if no variant is given we assume it to be standard chess
        variant = 'chess'
      }

      if (!context.getters.variantOptions.revGet(variant)) {
        alert('This variant is currently not supported.')
        return
      }

      const board = new ffish.Board(variant)
      const gameInfo = {}
      for (const curVal of payload.game.headerKeys().split(' ')) {
        gameInfo[curVal] = payload.game.headers(curVal)
      }

      context.commit('selectedGame', payload.game)
      context.commit('variant', variant)
      context.commit('newBoard', { fen: board.fen(), is960: board.is960() })
      context.commit('gameInfo', gameInfo)
      context.dispatch('push', payload.game.mainlineMoves())
      context.dispatch('updateBoard')
    },
    increment (context, payload) {
      context.commit('increment', payload)
    },
    pieceStyle (context, payload) {
      context.commit('pieceStyle', payload)
    }
  },
  getters: {
    board (state) {
      return state.board
    },
    initialized (state) {
      return state.initialized
    },
    active (state) {
      return state.active
    },
    redraw (state) {
      return state.redraw
    },
    fen (state) {
      return state.fen
    },
    lastFen (state) {
      return state.lastFen
    },
    destinations (state) {
      return state.destinations
    },
    orientation (state) {
      return state.orientation
    },
    variant (state) {
      return state.variant
    },
    variantOptions (state) {
      return state.variantOptions
    },
    engineBinary (state) {
      return state.engineBinary
    },
    stdIO (state) {
      return state.stdIO
    },
    idName (state) {
      return state.idName
    },
    idAuthor (state) {
      return state.idAuthor
    },
    multipv (state) {
      return state.multipv
    },
    hoveredpv (state) {
      return state.hoveredpv
    },
    cp (state) {
      return state.multipv[0].cp
    },
    depth (state) {
      return state.engineStats.depth
    },
    nps (state) {
      return state.engineStats.nps
    },
    seldepth (state) {
      return state.engineStats.seldepth
    },
    nodes (state) {
      return state.engineStats.nodes
    },
    hashfull (state) {
      return state.engineStats.hashfull
    },
    tbhits (state) {
      return state.engineStats.tbhits
    },
    time (state) {
      return state.engineStats.time
    },
    pv (state) {
      return state.multipv[0].pv
    },
    cpForWhite (state) {
      return calcForSide(state.multipv[0].cp, state.turn)
    },
    cpForWhiteStr (state, getters) {
      const { mate } = state.multipv[0]
      if (mate) {
        return `#${calcForSide(mate, state.turn)}`
      } else {
        return cpToString(getters.cpForWhite)
      }
    },
    cpForWhitePerc (state, getters) {
      const { mate } = state.multipv[0]
      if (mate) {
        return ((state.turn ? Math.sign(mate) : -Math.sign(mate)) + 1) / 2
      } else {
        return 1 / (1 + Math.exp(-0.003 * getters.cpForWhite))
      }
    },
    message (state) {
      return state.message.toUpperCase()
    },
    counter (state) {
      return state.counter
    },
    pieceStyle (state) {
      return state.pieceStyle
    },
    turn (state) {
      return state.turn
    },
    moves (state) {
      return state.moves
    },
    legalMoves (state) {
      return state.legalMoves
    },
    pocket (state) {
      return (turn) => state.board.pocket(turn)
    },
    gameInfo (state) {
      return state.gameInfo
    },
    loadedGames (state) {
      return state.loadedGames
    },
    selectedGame (state) {
      return state.selectedGame
    },

    // TODO: integrate getters into store state?
    moveStack (state) {
      return state.board.moveStack()
    },
    isGameOver (state) {
      return state.board.isGameOver()
    },
    sanMove (state) {
      return (uciMove) => state.board.sanMove(uciMove)
    },
    is960 (state) {
      return state.board.is960()
    }
  }
})

ffish.onRuntimeInitialized = () => {
  store.dispatch('initialize')
}

(async () => {
  ipc.on('output', line => store.dispatch('stdIO', line))
  ipc.on('input', line => store.dispatch('stdIO', `> ${line}`))
  ipc.on('info', info => store.dispatch('updateMultiPV', info))
  const engineInfo = await ipc.runEngine()
  console.log('Received Options:', engineInfo.options)
  ipc.send('setoption name MultiPV value 5')
  ipc.send('setoption name UCI_AnalyseMode value true')
  ipc.send(`setoption name UCI_Variant value ${store.getters.variant}`)
  ipc.send('setoption name Analysis Contempt value Off')
})()
