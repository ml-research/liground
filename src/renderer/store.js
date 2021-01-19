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

/**
 * Check if an option value is valid and emit warnings if necessary.
 * @param {any[]} options Array of engine options
 * @param {string} name Name of option
 * @param {any} value Option value to check
 */
function checkOption (options, name, value) {
  const option = options.find(e => e.name === name)
  if (!option) {
    console.warn(`[Engine] Unknown option "${name}"`)
  } else {
    switch (option.type) {
      case 'check':
        if (typeof value !== 'boolean') {
          console.warn(`[Engine] Invalid value type "${value}" for check option "${name}"`)
        }
        break
      case 'spin':
        if (typeof value !== 'number') {
          console.warn(`[Engine] Invalid value "${value}" for spin option "${name}"`)
        } else if (typeof option.max === 'number' && value > option.max) {
          console.warn(`[Engine] Out of range value "${value}" for spin option "${name}" (range ${option.min} to ${option.max})`)
        } else if (typeof option.min === 'number' && value < option.min) {
          console.warn(`[Engine] Out of range value "${value}" for spin option "${name}" (range ${option.min} to ${option.max})`)
        }
        break
      case 'combo':
        if (typeof value !== 'string') {
          console.warn(`[Engine] Invalid value "${value}" for combo option "${name}"`)
        } else if (Array.isArray(option.var) && !option.var.includes(value)) {
          console.warn(`[Engine] Unknown value "${value}" for combo option "${name}" (values ${option.var.map(e => `"${e}"`).join(', ')})`)
        }
        break
      case 'button':
        if (value !== undefined && value !== null) {
          console.warn(`[Engine] Unexpected value "${value}" for button option "${name}"`)
        }
        break
      case 'string':
        if (typeof value !== 'string') {
          console.warn(`[Engine] Invalid value "${value}" for string option "${name}"`)
        }
        break
    }
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
      '🏇 Racing Kings': 'racingkings',
      Makruk: 'makruk',
      Shogi: 'shogi',
      Janggi: 'janggi',
      Xiangqi: 'xiangqi'

    }),
    orientation: 'white',
    message: 'hello from Vuex',
    engineBinary: 'stockfish',
    stdIO: [],
    engineInfo: {
      name: '',
      author: '',
      options: []
    },
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
    selectedGame: null,
    boardStyle: 'blue',
    internationalVariants: [
      'chess', 'crazyhouse', 'horde', 'kingofthehill', '3check', 'racingkings', 'antichess'
    ],
    seaVariants: [
      'makruk'
    ],
    xiangqiVariants: [
      'janggi', 'xiangqi'
    ],
    shogiVariants: [
      'shogi'
    ],
    curVar960Fen: '',
    viewAnalysis: true
  },
  mutations: { // sync
    curVar960Fen (state, payload) {
      state.curVar960Fen = payload
    },
    viewAnalysis (state, payload) {
      state.viewAnalysis = payload
    },
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
    clearIO (state) {
      state.stdIO = []
    },
    engineInfo (state, payload) {
      state.engineInfo = payload
    },
    engineStats (state, payload) {
      state.engineStats = payload
    },
    resetEngineStats (state) {
      state.engineStats = {
        depth: 0,
        seldepth: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        time: 0
      }
    },
    multipv (state, payload) {
      for (const pvline of payload) {
        if (pvline) {
          pvline.cpDisplay = typeof pvline.mate === 'number' ? `#${calcForSide(pvline.mate, state.turn)}` : cpToString(calcForSide(pvline.cp, state.turn))
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
    boardStyle (state, payload) {
      state.boardStyle = payload
    },
    newBoard (state, payload) {
      const { fen, is960 } = payload || {}
      if (typeof fen === 'string') {
        if (is960) {
          state.board = new ffish.Board(state.variant, fen, true)
        } else {
          state.board = new ffish.Board(state.variant, fen)
        }
      } else {
        state.board = new ffish.Board(state.variant)
      }
      state.moves = []
      state.gameInfo = {}
      state.fen = state.board.fen()
      state.turn = state.board.turn()
      state.legalMoves = state.board.legalMoves()
      state.lastFen = state.board.fen()
    },
    resetBoard (state, payload) {
      state.curVar960Fen = ''
      this.commit('newBoard', payload)
      state.selectedGame = null
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
    curVar960Fen (context, payload) {
      context.commit('curVar960Fen', payload)
    },
    resetBoard (context, payload) {
      context.commit('resetMultiPV')
      context.commit('resetBoard', payload)
      context.dispatch('restartEngine')
    },
    initialize (context) {
      context.commit('newBoard')
      context.dispatch('updateBoard')
      context.commit('initialized', true)
    },
    updateBoard (context) {
      const { board } = context.state
      board.setFen(context.state.fen)
      context.commit('turn', board.turn())
      context.commit('legalMoves', board.legalMoves())
    },
    push (context, payload) {
      context.commit('appendMoves', payload.split(' '))
      context.dispatch('fen', context.state.board.fen())
    },
    resetEngineData (context) {
      context.commit('resetMultiPV')
      context.commit('resetEngineStats')
    },
    goEngine (context) {
      ipc.send('go infinite')
      context.commit('active', true)
    },
    stopEngine (context) {
      ipc.send('stop')
      context.commit('active', false)
    },
    restartEngine (context) {
      context.dispatch('resetEngineData')
      if (context.getters.active) {
        context.dispatch('stopEngine')
        context.dispatch('position')
        context.dispatch('goEngine')
      }
    },
    position (context) {
      ipc.send(`position fen ${context.getters.fen}`)
    },
    sendEngineCommand (_, payload) {
      ipc.send(payload)
    },
    fen (context, payload) {
      if (context.state.fen !== payload) {
        context.commit('fen', payload)
        context.dispatch('updateBoard')
        context.dispatch('restartEngine')
      }
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
        const variants = ['chess', 'crazyhouse', 'racingkings', '3check', 'antichess']
        if (variants.includes(payload)) {
          const varFen = context.getters.curVar960Fen
          const is960Mode = varFen !== ''
          context.commit('newBoard', { is960: is960Mode, fen: varFen })
        } else {
          context.commit('newBoard', { is960: false, fen: '' })
        }
        context.dispatch('resetEngineData')
        ipc.send(`setoption name UCI_Variant value ${payload}`)
      }
    },
    set960 (context, payload) {
      context.commit('newBoard', {
        fen: payload.fen,
        is960: payload.is960
      })
    },
    async engineBinary (context, payload) {
      if (context.getters.engineBinary !== payload) {
        context.commit('engineBinary', payload)
        context.commit('clearIO')
        context.dispatch('resetEngineData')
        context.commit('engineInfo', await ipc.setBinary(payload))
        context.dispatch('initEngineOptions')
      }
    },
    initEngineOptions (context) {
      context.dispatch('setEngineOptions', {
        MultiPV: 5,
        UCI_AnalyseMode: true,
        UCI_Variant: context.getters.variant,
        'Analysis Contempt': 'Off'
      })
    },
    setEngineOptions (context, payload) {
      for (const [name, value] of Object.entries(payload)) {
        checkOption(context.state.engineInfo.options, name, value)
        ipc.send(`setoption name ${name} value ${value}`)
      }
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
      if ('pv' in payload) {
        const multipv = context.getters.multipv.slice(0)

        // handle checkmate
        if (payload.mate === 0) {
          multipv[0] = { mate: payload.mate }
        } else {
          const ucimove = payload.pv.split(/\s/)[0]
          const { board } = context.state

          // assert first move is valid
          if (board.legalMoves().includes(ucimove)) {
            const pvline = {
              cp: payload.cp,
              mate: payload.mate,
              ucimove
            }
            try {
              pvline.pv = board.variationSan(payload.pv)
            } catch (err) {
              // currently invalid moves cause ffish to error mid calculation and fail to reset the fen
              // so to avoid getting stuck with a future fen, we reset the board fen on error
              board.setFen(context.state.fen)
              console.warn('Invalid engine pv move.\nFEN:', board.fen(), '\nPV:', payload.pv)
            }
            multipv[payload.multipv - 1] = pvline
          }
        }
        context.commit('multipv', multipv)
      }
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
      context.dispatch('variant', variant)
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
    },
    viewAnalysis (context, payload) {
      context.commit('viewAnalysis', payload)
    },
    boardStyle (context, payload) {
      context.commit('boardStyle', payload)
    }
  },
  getters: {
    curVar960Fen (state) {
      return state.curVar960Fen
    },
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
    isPast (state, getters) {
      return state.fen !== getters.lastFen
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
    engineName (state) {
      return state.engineInfo.name
    },
    engineAuthor (state) {
      return state.engineInfo.author
    },
    engineOptions (state) {
      return state.engineInfo.options
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
      if (typeof mate === 'number') {
        return `#${calcForSide(mate, state.turn)}`
      } else {
        return cpToString(getters.cpForWhite)
      }
    },
    cpForWhitePerc (state, getters) {
      const { mate } = state.multipv[0]
      if (typeof mate === 'number') {
        return (calcForSide(Math.sign(mate), state.turn) + 1) / 2
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
    boardStyle (state) {
      return state.boardStyle
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
    },
    isInternational (state) {
      return state.internationalVariants.includes(state.variant)
    },
    isSEA (state) {
      return state.seaVariants.includes(state.variant)
    },
    isXiangqi (state) {
      return state.xiangqiVariants.includes(state.variant)
    },
    isShogi (state) {
      return state.shogiVariants.includes(state.variant)
    },
    dimensionNumber (state) {
      if (state.internationalVariants.includes(state.variant)) {
        return 0
      } else {
        const var2Dim = {
          shogi: 1, xiangqi: 3, janggi: 3, makruk: 0
        }
        return var2Dim[state.variant]
      }
    },
    viewAnalysis (state) {
      return state.viewAnalysis
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
  store.commit('engineInfo', await ipc.runEngine())
  store.dispatch('initEngineOptions')
})()
