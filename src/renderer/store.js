import Vue from 'vue'
import Vuex from 'vuex'
import ffish from 'ffish'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    active: false,
    started: false,
    destinations: {},
    variant: 'chess',
    engineBinary: 'stockfish',
    stdIO: [],
    message: 'hello from Vuex',
    idName: 'idName',
    idAuthor: 'idAuthor',
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
    pieceStyle: 'tatiana',
    board: null
  },
  mutations: { // sync
    active (state, payload) {
      state.active = payload
    },
    started (state, payload) {
      state.started = payload
    },
    fen (state, payload) {
      state.board.setFen(payload)
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
    updateBoard (state, payload) {
      state.board = new ffish.Board(state.variant, payload.fen, payload.is960)
    },
    push (state, payload) {
      state.board.push(payload)
      console.log('pushed new move: '+payload)
    }
  },
  actions: { // async
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
    fen (context, payload) {
      context.commit('fen', payload)
    },
    destinations (context, payload) {
      context.commit('destinations', payload)
    },
    started (context, payload) {
      context.commit('started', payload)
    },
    active (context, payload) {
      context.commit('active', payload)
    },
    variant (context, payload) {
      if (context.getters.variant !== payload) {
        context.commit('variant', payload)
        context.commit('updateBoard', {
          fen: context.getters.fen,
          is960: context.getters.is960
        })
      }
    },
    set960 (context, payload) {
      if (context.getters.is960 !== payload) {
        context.commit('updateBoard', {
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
    increment (context, payload) {
      context.commit('increment', payload)
    },
    pieceStyle (context, payload) {
      context.commit('pieceStyle', payload)
    }
  },
  getters: {
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
      //return state.board.fen()
      if(state.board !== null){
        console.log('fen_store:'+state.board.fen())
        return state.board.fen()
      } else {
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    },
    destinations (state) {
      return state.destinations
    },
    variant (state) {
      return state.variant
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
      if(state.board !== null){
      return state.board.turn()
      } else{
        return 'white'
      }
    },
    legalMoves (state) {
      return state.board.legalMoves()
    },
    pocket (state) {
      return (turn) => state.board.pocket(turn)
    },
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
  store.commit('updateBoard', {
    fen: '',
    is960: false
  })
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
