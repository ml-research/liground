import Vue from 'vue'
import Vuex from 'vuex'
import electron from 'electron'
import fs from 'fs'
import Module from 'ffish-es6'
let ffish = null

new Module().then(loadedModule => {
    ffish = loadedModule;
    console.log(`initialized ${ffish} ${loadedModule}`);
    }
);

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    active: false,
    started: false,
    fen: '',
    destinations: {},
    variant: 'crazyhouse',
    engineBinary: 'stockfish',
    stdIO: [],
    message: 'hello from Vuex',
    idName: 'idName',
    idAuthor: 'idAuthor',
    multipv: [{
      'depth': 0,
      'seldepth': 0,
      'cp': 0,
      'nodes': 0,
      'nps': 0,
      'hashfull': 0,
      'tbhits': 0,
      'time': 0,
      'pv': '',
      'ucimove': ''
    },
    {'pv': ''},
    {},
    {},
    {}],
    sideToMove: 'w',
    counter: 0,
    pieceStyle: 'tatiana'
  },
  mutations: { // sync
    active (state, payload) {
      state.active = payload
    },
    started (state, payload) {
      state.started = payload
    },
    fen (state, payload) {
      state.fen = payload
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
            state.multipv[idx]['cpDisplay'] = '#' + String(-state.multipv[idx].mate)
          } else {
            state.multipv[idx]['cpDisplay'] = '#' + state.multipv[idx].mate
          }
        } else {
          const cpWhite = cpForWhite(state.multipv[idx].cp, state.sideToMove)
          state.multipv[idx]['cpDisplay'] = cpforWhiteStr(cpWhite)
        }
      }
    },
    increment (state, payload) {
      state.counter += payload
    },
    resetMultiPV (state) {
      state.multipv = [{
        'depth': 0,
        'seldepth': 0,
        'cp': 0,
        'nodes': 0,
        'nps': 0,
        'hashfull': 0,
        'tbhits': 0,
        'time': 0,
        'pv': '',
        'ucimove': ''
      },
      {'pv': ''},
      {},
      {},
      {}
      ]
    },
    pieceStyle (state, payload) {
      state.pieceStyle = payload
    }
  },
  actions: { // async
    startEngine (state) {
      ws.send('startEngine~' + state.getters.engineBinary + '~' + state.getters.variant)
      console.log('startEngine')
      state.commit('started', true)
    },
    goEngine (state) {
      ws.send('goEngine')
      console.log('goEngine')
      state.commit('active', true)
    },
    stopEngine (state) {
      ws.send('stopEngine')
      console.log('stopEngine')
      state.commit('active', false)
    },
    resetMultiPV (state) {
      state.commit('resetMultiPV')
    },
    position (state) {
      ws.send(`position~fen~${state.getters.fen}`)
      state.commit('sideToMove', state.getters.fen.split(' ')[1])
      console.log(`state.sideToMove: ${state.sideToMove}`)
    },
    fen (state, payload) {
      state.commit('fen', payload)
    },
    destinations (state, payload) {
      state.commit('destinations', payload)
    },
    started (state, payload) {
      state.commit('started', payload)
    },
    active (state, payload) {
      state.commit('active', payload)
    },
    variant (state, payload) {
      state.commit('variant', payload)
    },
    engineBinary (state, payload) {
      state.commit('engineBinary', payload)
    },
    stdIO (state, payload) {
      state.commit('stdIO', payload)
    },
    idName (state, payload) {
      state.commit('idName', payload)
    },
    idAuthor (state, payload) {
      state.commit('idAuthor', payload)
    },
    multipv (state, payload) {
      state.commit('multipv', payload)
    },
    increment (state, payload) {
      state.commit('increment', payload)
    },
    pieceStyle (state, payload) {
      state.commit('pieceStyle', payload)
    },
    async openPgnFile (state, payload) {
      const result = await electron.remote.dialog.showOpenDialog({
        title: 'Open PGN file',
        properties: ['openFile'], 
        filters: [
          { name: 'PGN Files', extensions: ['pgn'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (!result.canceled) {
        console.log(result.filePaths[0])
        fs.readFile(result.filePaths[0], 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          let game = ffish.readGamePGN(data);
          const variant = game.headers("Variant").toLowerCase();
        })
      }

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
      return state.fen
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
        state.multipv[0]['ucimove'],
        state.multipv[1]['ucimove'],
        state.multipv[2]['ucimove'],
        state.multipv[3]['ucimove'],
        state.multipv[4]['ucimove']
      ]
    },
    cp (state) {
      return state.multipv[0]['cp']
    },
    depth (state) {
      return state.multipv[0]['depth']
    },
    nps (state) {
      return state.multipv[0]['nps']
    },
    seldepth (state) {
      return state.multipv[0]['seldepth']
    },
    nodes (state) {
      return state.multipv[0]['nodes']
    },
    hashfull (state) {
      return state.multipv[0]['hashfull']
    },
    tbhits (state) {
      return state.multipv[0]['tbhits']
    },
    time (state) {
      return state.multipv[0]['time']
    },
    pv (state) {
      return state.multipv[0]['pv']
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
    }
  }
})

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
  var json = JSON.parse(data)

  const items = ['idAuthor', 'idName', 'stdIO', 'multipv', 'destinations']
  dispatchToStore(items, json, store)
})
