import Vue from 'vue'
import Vuex from 'vuex'
import ffish from 'ffish'

class TwoWayMap {
  constructor(map) {
    this.map = map
    this.reverseMap = {}
    this.keys = []
    for (let key in map) {
      const value = map[key]
      this.reverseMap[value] = key
      this.keys.concat(key)
    }
  }
  getAll() { return this.map }
  get(key) { return this.map[key] }
  revGet(key) { return this.reverseMap[key] }
}

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    initialized: false,
    started: false,
    active: false,
    turn: 'white',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    lastFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', //to track the end of the current line
    moves: [],
    legalMoves: '',
    check: false,
    destinations: {},
    variant: 'chess',
    variantOptions: new TwoWayMap({ //all the currently supported options are listed here, variantOptions.get returns the right side, variantOptions.revGet returns the left side of the dict
      '♟️ Standard': '',
      '♟️ Standard': 'chess', 
      '🏠 Crazyhouse': 'crazyhouse', 
      '⛰️ King of the Hill': 'kingofthehill', 
      '️Three-Check': '3check', 
      'Antichess': 'antichess', 
      'Horde': 'horde',
      '🏇 Racing Kings': 'racingkings'}),
    engineBinary: 'stockfish',
    stdIO: [],
    message: 'hello from Vuex',
    idName: 'idName',
    idAuthor: 'idAuthor',
    orientation: 'white',
    multipv: [
      {
        depth: 0,
        seldepth: 0,
        cp: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        time: 0,
        pv: '',
        ucimove: ''
      },
      {
        pv: ''
      },
      {},
      {},
      {}
    ],
    sideToMove: 'w',
    counter: 0,
    pieceStyle: 'merida',
    board: null
  },
  mutations: { // sync
    fen (state, payload) {
      state.fen = payload
    },
    check (state, payload) {
      state.check = payload
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
    started (state, payload) {
      state.started = payload
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
    sideToMove (state, payload) {
      state.sideToMove = payload
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
    multipv (state, payload) {
      state.multipv = payload
      for (let idx = 0; idx < state.multipv.length; ++idx) {
        if (state.multipv[idx].mate) {
          if (state.sideToMove === 'b') {
            state.multipv[idx].cpDisplay = '#' + String(-state.multipv[idx].mate)
          } else {
            state.multipv[idx].cpDisplay = '#' + state.multipv[idx].mate
          }
        } else {
          const cpWhite = cpForWhite(state.multipv[idx].cp, state.sideToMove)
          state.multipv[idx].cpDisplay = cpforWhiteStr(cpWhite)
        }
      }
    },
    increment (state, payload) {
      state.counter += payload
    },
    resetMultiPV (state) {
      state.multipv = [{
        depth: 0,
        seldepth: 0,
        cp: 0,
        nodes: 0,
        nps: 0,
        hashfull: 0,
        tbhits: 0,
        time: 0,
        pv: '',
        ucimove: ''
      },
      {
        pv: ''
      },
      {},
      {},
      {}
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
      this.commit('fen', state.board.fen())
      this.commit('turn', state.board.turn())
      this.commit('legalMoves', state.board.legalMoves())
      this.commit('lastFen', state.board.fen())
    },
    resetBoard (state, payload) {
      state.board = new ffish.Board(state.variant, payload.fen, payload.is960)
      state.moves = []
    },
    appendMoves (state, payload) {
      state.moves = state.moves.concat(payload.map( (curVal,idx, arr) =>{
        let sanMove = state.board.sanMove(curVal)
        state.board.push(curVal);
        return {ply: state.moves.length + idx + 1, name: sanMove, fen: state.board.fen()};
      }))
      state.lastFen = state.board.fen()
    }
  },
  actions: { // async
    initialize (context) {
      context.commit('newBoard', {
        fen: '',
        is960: false
      })
      context.dispatch('updateBoard')
      context.commit('initialized', true)
    },
    updateBoard (context) {
      context.commit('turn', context.state.board.turn())
      context.commit('fen', context.state.board.fen())
      context.commit('legalMoves', context.state.board.legalMoves())
    },
    push (context, payload) {
      context.commit('appendMoves', payload.split(" "))
      context.dispatch('updateBoard')
    },
    startEngine (context) {
      ws.send('startEngine~' + context.getters.engineBinary + '~' + context.getters.variant)
      console.log('startEngine')
      context.commit('started', true)
    },
    goEngine (context) {
      ws.send('goEngine')
      console.log('goEngine')
      context.commit('active', true)
    },
    stopEngine (context) {
      ws.send('stopEngine')
      console.log('stopEngine')
      context.commit('active', false)
    },
    resetMultiPV (context) {
      context.commit('resetMultiPV')
    },
    position (context) {
      ws.send(`position~fen~${context.getters.fen}`)
      context.commit('sideToMove', context.getters.fen.split(' ')[1])
      console.log(`state.sideToMove: ${context.sideToMove}`)
    },
    check (context, payload) {
      context.commit('check', payload)
    },
    fen (context, payload) {
      context.commit('fen', payload)
    },
    lastFen (context, payload) {
      context.commit('lastFen', payload)
    },
    destinations (context, payload) {
      context.commit('destinations', payload)
    },
    started (context, payload) {
      context.commit('started', payload)
    },
    orientation (context, payload) {
      context.commit('orientation', payload)
    },
    active (context, payload) {
      context.commit('active', payload)
    },
    variant (context, payload) {
      if (context.getters.variant !== payload) {
        context.commit('variant', payload)
        context.commit('newBoard', {
        })
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
    multipv (context, payload) {
      context.commit('multipv', payload)
    },
    loadGame (context, payload) {
      let variant = payload.game.headers("Variant").toLowerCase();
      const board = new ffish.Board(variant);
      if ( variant == '') { //if no variant is given we assume it to be standard chess
        variant = 'chess'
      }
      context.commit('variant', variant)
      context.commit('newBoard', { fen: board.fen(), is960: board.is960() })
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
    check (state) {
      return state.check
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
    started (state) {
      return state.started
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
    bestmove (state) {
      return [
        state.multipv[0].ucimove,
        state.multipv[1].ucimove,
        state.multipv[2].ucimove,
        state.multipv[3].ucimove,
        state.multipv[4].ucimove
      ]
    },
    cp (state) {
      return state.multipv[0].cp
    },
    depth (state) {
      return state.multipv[0].depth
    },
    nps (state) {
      return state.multipv[0].nps
    },
    seldepth (state) {
      return state.multipv[0].seldepth
    },
    nodes (state) {
      return state.multipv[0].nodes
    },
    hashfull (state) {
      return state.multipv[0].hashfull
    },
    tbhits (state) {
      return state.multipv[0].tbhits
    },
    time (state) {
      return state.multipv[0].time
    },
    pv (state) {
      return state.multipv[0].pv
    },
    cpForWhite (state) {
      return cpForWhite(state.multipv[0].cp, state.sideToMove)
    },
    cpforWhiteStr (state, getters) {
      if (state.multipv[0].mate) {
        if (state.sideToMove === 'b') {
          return '#' + String(-state.multipv[0].mate)
        } else {
          return '#' + state.multipv[0].mate
        }
      }
      return cpforWhiteStr(getters.cpForWhite)
    },
    cpforWhitePerc (state) {
      if (state.multipv[0].mate) {
        if (state.sideToMove === 'b') {
          return (-Math.sign(state.multipv[0].mate) + 1) / 2
        } else {
          return (Math.sign(state.multipv[0].mate) + 1) / 2
        }
      }
      const k = 0.003
      const e = 2.7
      return 1 / (1 + e ** (-k * cpForWhite(state.multipv[0].cp, state.sideToMove)))
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

function cpForWhite (cp, sideToMove) {
  if (sideToMove === 'b') {
    return -cp
  }
  return cp
}

function cpforWhiteStr (cpForWhite) {
  if (String(cpForWhite) === 'NaN' || String(cpForWhite) === '-NaN') {
    return ''
  }
  const normalizedEval = (cpForWhite / 100).toFixed(2)

  if (normalizedEval > 0) {
    return '+' + String(normalizedEval)
  }
  if (normalizedEval === 0) {
    return '±0.00'
  }
  return '-' + String(-normalizedEval)
}

function dispatchToStore (items, json, store) {
  for (let idx = 0; idx < items.length; ++idx) {
    const item = items[idx]
    if (item in json) {
      store.dispatch(item, json[item])
    }
  }
}

const ws = new WebSocket('ws://localhost:8082')

ws.addEventListener('open', () => {
  console.log('We are connected')
  ws.send('Hello!')
})

ws.addEventListener('message', ({
  data
}) => {
  const json = JSON.parse(data)

  const items = ['idAuthor', 'idName', 'stdIO', 'multipv', 'destinations']
  dispatchToStore(items, json, store)
})
