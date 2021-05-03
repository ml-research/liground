import Vue from 'vue'
import Vuex from 'vuex'
import ffish from 'ffish'
import engine from './engine'
import allEngines from './store/engines'

import moveAudio from './assets/audio/Move.mp3'
import captureAudio from './assets/audio/Capture.mp3'

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
    return '0.00'
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

const filteredSettings = ['UCI_Variant', 'UCI_Chess960']

export const store = new Vuex.Store({
  state: {
    initialized: false,
    active: false,
    turn: true,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    lastFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // to track the end of the current line
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moves: [],
    firstMoves: [],
    mainFirstMove: null,
    legalMoves: '',
    destinations: {},
    variant: 'chess',
    variantOptions: new TwoWayMap({ // all the currently supported options are listed here, variantOptions.get returns the right side, variantOptions.revGet returns the left side of the dict
      Standard: 'chess',
      Crazyhouse: 'crazyhouse',
      'King of the Hill': 'kingofthehill',
      '️Three-Check': '3check',
      Antichess: 'antichess',
      Atomic: 'atomic',
      Horde: 'horde',
      'Racing Kings': 'racingkings',
      Makruk: 'makruk',
      Shogi: 'shogi',
      Janggi: 'janggi',
      Xiangqi: 'xiangqi'

    }),
    openedPGN: false,
    evalPlotDepth: 20,
    orientation: 'white',
    message: 'hello from Vuex',
    allEngines,
    activeEngine: null,
    selectedEngines: {},
    engineInfo: {
      name: '',
      author: '',
      options: []
    },
    engineSettings: {},
    engineStats: {
      depth: 0,
      seldepth: 0,
      nodes: 0,
      nps: 0,
      hashfull: 0,
      tbhits: 0,
      time: 0
    },
    enginetime: 0,
    multipv: [
      {
        cp: 0,
        pv: '',
        ucimove: ''
      }
    ],
    hoveredpv: -1,
    counter: 0,
    pieceStyle: 'cburnett',
    board: null,
    gameInfo: {},
    loadedGames: [],
    rounds: null,
    selectedGame: null,
    boardStyle: 'blue',
    curVar960Fen: '',
    viewAnalysis: true,
    analysisMode: true,
    menuAtMove: null,
    displayMenu: true,
    darkMode: false,
    fenply: 1,
    internationalVariants: [
      'chess', 'crazyhouse', 'horde', 'kingofthehill', '3check', 'racingkings', 'antichess', 'atomic'
    ],
    seaVariants: [
      'makruk'
    ],
    xiangqiVariants: [
      'xiangqi'
    ],
    janggiVariants: [
      'janggi'
    ],
    shogiVariants: [
      'shogi'
    ],
    clock: null
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
    startFen (state, payload) {
      state.startFen = payload
    },
    lastFen (state, payload) {
      state.lastFen = payload
    },
    turn (state, payload) {
      state.turn = payload
    },
    mainFirstMove (state, payload) {
      state.mainFirstMove = payload
    },
    firstMoves (state, payload) {
      state.firstMoves.push(payload)
    },
    deleteFromFirstMoves (state, payload) {
      state.firstMoves.splice(state.firstMoves.indexOf(payload), 1)
    },
    deleteFromMoves (state, payload) {
      for (const index in payload.next) {
        this.commit('deleteFromMoves', payload.next[index])
      }
      state.moves.splice(state.moves.indexOf(payload), 1)
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
      if (payload === 'racingkings') {
        state.orientation = 'white'
      }
      state.variant = payload
    },
    selectedEngines (state, payload) {
      state.selectedEngines = payload
    },
    clearIO () {
      // dummy to trigger update in console
    },
    engineInfo (state, payload) {
      state.engineInfo = payload
      const settings = {}
      for (const option of payload.options) {
        if (!filteredSettings.includes(option.name)) {
          switch (option.type) {
            case 'check':
              settings[option.name] = option.default === 'true'
              break
            case 'spin':
            case 'combo':
              settings[option.name] = option.default
              break
            case 'string':
              settings[option.name] = option.default || ''
              break
          }
        }
      }
      state.engineSettings = settings
    },
    engineStats (state, payload) {
      state.engineStats = payload
    },
    resetEngineStats (state) {
      state.enginetime = 0
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
        if (is960) {
          console.log(state.curVar960Fen)
          state.board = new ffish.Board(state.variant, state.curVar960Fen, true)
        } else {
          state.board = new ffish.Board(state.variant)
        }
      }
      state.moves = []
      state.mainFirstMove = null
      state.firstMoves = []
      state.gameInfo = {}
      state.fen = state.board.fen()
      state.turn = state.board.turn()
      state.legalMoves = state.board.legalMoves()
      state.lastFen = state.board.fen()
      state.startFen = state.board.fen()
      state.selectedGame = null
      state.fenply = 1
      this.commit('resetEngineStats')
    },
    resetBoard (state, payload) {
      if (!payload.is960) {
        state.curVar960Fen = ''
      }
      this.commit('newBoard', payload)
      state.selectedGame = null
      state.moves = []
    },
    appendMoves (state, payload) {
      const mov = payload.move.split(' ')
      const prev = payload.prev
      let ply
      if (prev) {
        ply = prev.ply + 1
      } else { // then its a starting move
        if (state.turn) {
          ply = state.fenply
        } else {
          ply = state.fenply + 1
        }
      }
      let alreadyInMoves = false
      for (const num in state.moves) {
        if (state.moves[num].uci === mov[0] && state.moves[num].prev === prev) {
          alreadyInMoves = state.moves[num] // if the move is already in the history its stored here
        }
      }
      if (!alreadyInMoves) {
        state.moves = state.moves.concat(mov.map((curVal, idx, arr) => {
          const sanMove = state.board.sanMove(curVal)
          state.board.push(curVal)
          this.commit('playAudio', sanMove)
          return { ply: ply, name: sanMove, fen: state.board.fen(), uci: curVal, whitePocket: state.board.pocket(true), blackPocket: state.board.pocket(false), main: undefined, next: [], prev: prev }
        }))
        if (payload.prev) { // if the move is not a starting move
          prev.next.push(state.moves[state.moves.length - 1]) // the last entry in moves is the move object of the current move
          if (!prev.main) { // if there is no mainline yet, then this move is the main line now
            prev.main = state.moves[state.moves.length - 1]
          }
        } else { // then the currently added move was a starting move
          this.commit('firstMoves', state.moves[state.moves.length - 1]) // then we add it to the firstMoves array
          if (state.moves.length === 1) {
            this.commit('mainFirstMove', state.moves[0]) // then this is our mainFirstMove
          }
        }
      } else {
        state.board.push(alreadyInMoves.uci)
      }
      state.lastFen = state.board.fen()
    },
    playAudio (state, move) { // Sounds from lichess https://github.com/ornicar/lila
      if (state.openedPGN) {
        return
      }
      let note = new Audio(moveAudio)
      if (move.toString().includes('x')) {
        note = new Audio(captureAudio)
      }
      note.play()
    },
    gameInfo (state, payload) {
      state.gameInfo = payload
    },
    loadedGames (state, payload) {
      state.loadedGames = payload
      state.selectedGame = null
    },
    rounds (state, payload) {
      state.rounds = payload
    },
    selectedGame (state, payload) {
      state.selectedGame = payload
    },
    analysisMode (state, payload) {
      state.analysisMode = payload
    },
    openedPGN (state, payload) {
      state.openedPGN = payload
    },
    menuAtMove (state, payload) {
      state.menuAtMove = payload
    },
    displayMenu (state, payload) {
      state.displayMenu = payload
    },
    switchDarkMode (state) {
      state.darkMode = !state.darkMode
      localStorage.darkMode = state.darkMode
    },
    evalPlotDepth (state, payload) {
      state.evalPlotDepth = payload
      localStorage.evalPlotDepth = payload
    },
    fenply (state, payload) {
      state.fenply = payload
    },
    movesChangeDummy (state, payload) {
      state.moves = []
      state.moves = payload
    },
    setEngineClock (state) {
      state.clock = setInterval(function () { state.enginetime = state.enginetime + 1000 }, 1000)
    },
    resetEngineTime (state) {
      clearInterval(state.clock)
    }
  },
  actions: { // async
    movesChangeDummy (context, payload) {
      context.commit('movesChangeDummy', payload)
    },
    playAudio (context, payload) {
      context.commit('playAudio', payload)
    },
    curVar960Fen (context, payload) {
      context.commit('curVar960Fen', payload)
    },
    resetBoard (context, payload) {
      context.commit('resetMultiPV')
      context.commit('resetBoard', payload)
      context.dispatch('setEngineOptions', { UCI_Chess960: payload.is960 })
      context.dispatch('restartEngine')
    },
    initialize (context) {
      if (localStorage.evalPlotDepth) {
        context.state.evalPlotDepth = localStorage.evalPlotDepth
      }
      if (localStorage.darkMode) {
        if (localStorage.darkMode === 'true') {
          context.commit('switchDarkMode')
        }
      }
      if (localStorage.internationalPieceStyle) {
        context.commit('pieceStyle', localStorage.internationalPieceStyle)
      }
      if (localStorage.internationalBoardStyle) {
        context.commit('boardStyle', localStorage.internationalBoardStyle)
      }
      if (localStorage.variant) {
        context.commit('variant', localStorage.variant)
      }
      if (localStorage.engines) {
        try {
          context.state.allEngines = JSON.parse(localStorage.engines)
        } catch (err) {
          localStorage.removeItem('engines')
        }
      }
      context.commit('newBoard')
      context.dispatch('updateBoard')
      context.dispatch('changeEngine', context.getters.availableEngines[0].name)
      context.commit('initialized', true)
    },
    updateBoard (context) {
      const { board } = context.state
      board.setFen(context.state.fen)
      context.commit('turn', board.turn())
      context.commit('legalMoves', board.legalMoves())
    },
    push (context, payload) {
      context.commit('appendMoves', payload)
      context.dispatch('fen', context.state.board.fen())
    },
    pushMainLine (context, payload) {
      let prev = payload.prev
      for (const i in payload.line) {
        context.commit('appendMoves', { move: payload.line[i], prev: prev })
        const move = context.getters.getMoveByUCIAndPrev(payload.line[i], prev)[0]
        if (!prev) {
          context.commit('mainFirstMove', move)
          prev = move
        } else {
          prev.main = move
          prev = prev.main
        }
      }
      context.dispatch('fen', context.state.board.fen())
    },
    pushAltLine (context, payload) {
      let prev = payload.prev
      for (const i in payload.line) {
        context.commit('appendMoves', { move: payload.line[i], prev: prev })
        const move = context.getters.getMoveByUCIAndPrev(payload.line[i], prev)[0]
        console.log(move)
        if (!prev) {
          if (!context.state.mainFirstMove) {
            context.commit('mainFirstMove', move)
          }
        }
        prev = move
      }
      context.dispatch('fen', context.state.board.fen())
    },
    mainFirstMove (context, payload) {
      if (context.state.mainFirstMove !== payload) {
        context.commit('mainFirstMove', payload)
      }
    },
    firstMoves (context, payload) {
      if (!context.state.firstMoves.includes(payload)) {
        context.commit('firstMoves', payload)
      }
    },
    deleteFromMoves (context, payload) {
      if (!payload.prev) {
        context.commit('deleteFromFirstMoves', payload)
      }
      context.commit('deleteFromMoves', payload)
    },
    resetEngineData (context) {
      context.commit('resetMultiPV')
      context.commit('resetEngineStats')
    },
    goEngine (context) {
      engine.send('go infinite')
      context.commit('setEngineClock')
      context.commit('active', true)
    },
    stopEngine (context) {
      engine.send('stop')
      context.commit('resetEngineTime')
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
      engine.send(`position fen ${context.getters.fen}`)
      const eve = new CustomEvent('position', { detail: { fen: context.getters.fen } })
      document.dispatchEvent(eve)
    },
    sendEngineCommand (_, payload) {
      engine.send(payload)
    },
    fen (context, payload) {
      if (context.state.fen !== payload) {
        context.commit('fen', payload)
        context.dispatch('updateBoard')
        context.dispatch('restartEngine')
      }
    },
    fenField (context, payload) {
      if (ffish.validateFen(payload, context.getters.variant) === 1) { // this doesnt work properly for horde and racing kings
        if (context.state.fen !== payload) {
          context.commit('fen', payload)
          context.dispatch('updateBoard')
          context.dispatch('restartEngine')
          context.commit('newBoard', { fen: payload })
          let index = 1
          while (payload[payload.length - index] !== ' ') {
            index = index + 1
          }
          const numAsString = payload.substring(payload.length - index, payload.length)
          const ply = parseInt(numAsString)
          context.commit('fenply', 2 * ply - 1)
        }
      } else {
        alert('Please insert a valid FEN for the current variant')
      }
    },
    lastFen (context, payload) {
      context.commit('lastFen', payload)
    },
    startFen (context, payload) {
      context.commit('startFen', payload)
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
        // prepare engine
        if (context.getters.active) {
          context.dispatch('stopEngine')
        }
        context.dispatch('resetEngineData')
        const oldEngine = context.getters.selectedEngine

        // update variant
        context.commit('variant', payload)
        localStorage.variant = payload
        const variants = ['chess', 'crazyhouse', 'racingkings', '3check', 'antichess', 'atomic']
        if (variants.includes(payload)) {
          const varFen = context.getters.curVar960Fen
          const is960Mode = varFen !== ''
          context.commit('newBoard', { is960: is960Mode, fen: varFen })
        } else {
          context.commit('newBoard', { is960: false, fen: '' })
        }

        // switch to new engine
        const last = context.state.selectedEngines[payload]
        const newEngine = typeof last === 'string'
          ? last
          : (oldEngine && oldEngine.variants.includes(payload) ? oldEngine.name : context.getters.availableEngines[0].name)
        context.dispatch('changeEngine', newEngine).then(() => {
          context.dispatch('setEngineOptions', { UCI_Variant: payload })
        })
      }
    },
    set960 (context, payload) {
      context.commit('selectedGame', null)
      context.commit('resetMultiPV')
      context.commit('newBoard', {
        fen: payload.fen,
        is960: payload.is960
      })
      context.dispatch('setEngineOptions', { UCI_Chess960: payload.is960 })
    },
    async addEngine (context, payload) {
      // discover the variants by running the engine
      const { name, binary, cwd, logo } = payload
      const info = await engine.run(binary, cwd)
      const variantOption = info.options.find(option => option.name === 'UCI_Variant')
      const variants = variantOption ? variantOption.var : ['chess']

      // update engines
      context.state.allEngines = {
        ...context.state.allEngines,
        [name]: { binary, cwd, logo, variants }
      }
      localStorage.engines = JSON.stringify(context.state.allEngines)

      // swap back to current engine after we are done
      context.commit('clearIO')
      await engine.run(context.getters.engineBinary, context.getters.selectedEngine.cwd)
      await context.dispatch('initEngineOptions')
    },
    async editEngine (context, payload) {
      const { old, changed: { name, binary, cwd, logo } } = payload
      const engines = { ...context.state.allEngines }

      // grab new engine entry
      let updated
      if (name !== old) {
        engines[name] = { ...engines[old] }
        updated = engines[name]
        delete engines[old]
      } else {
        updated = engines[old]
      }

      // update logo
      updated.logo = logo

      // update active engine name
      context.state.activeEngine = name

      // update name in selected engines
      const selectedEngines = { ...context.state.selectedEngines }
      for (const [variant, selected] of Object.entries(selectedEngines)) {
        if (selected === old) {
          selectedEngines[variant] = name
        }
      }
      context.state.selectedEngines = selectedEngines

      // rerun if binary or cwd changed
      if (updated.binary !== binary || updated.cwd !== cwd) {
        await context.dispatch('runBinary', { binary, cwd })
        const variantOption = context.state.engineInfo.options.find(option => option.name === 'UCI_Variant')
        updated.variants = variantOption ? variantOption.var : ['chess']
      }
      updated.binary = binary
      updated.cwd = cwd

      // save engines
      context.state.allEngines = engines
      localStorage.engines = JSON.stringify(context.state.allEngines)
    },
    async deleteEngine (context, payload) {
      const engines = { ...context.state.allEngines }
      delete engines[payload]
      const missing = Object.entries(context.state.variantOptions.getAll())
        .filter(([_, variant]) => !Object.values(engines).find(engine => engine.variants.includes(variant)))
        .map(([name, _]) => name)
      if (missing.length > 0) {
        alert(`"${payload}" can not be deleted:\nOnly Engine supporting Variants ${missing.join(', ')}!`)
        return
      }
      context.state.allEngines = engines
      localStorage.engines = JSON.stringify(context.state.allEngines)
      await context.dispatch('changeEngine', context.getters.availableEngines[0].name)
    },
    async changeEngine (context, payload) {
      const id = payload

      // always update selected engines
      const selected = {
        ...context.state.selectedEngines,
        [context.getters.variant]: id
      }
      context.commit('selectedEngines', selected)

      // only change engine when its a different one
      if (context.state.activeEngine !== id) {
        context.state.activeEngine = id
        context.dispatch('runBinary', {
          binary: context.getters.engineBinary,
          cwd: context.getters.selectedEngine.cwd
        })
      }
    },
    async runBinary (context, payload) {
      const { binary, cwd } = payload
      if (context.getters.active) {
        context.commit('active', false)
      }
      context.commit('clearIO')
      await context.dispatch('resetEngineData')
      context.commit('engineInfo', await engine.run(binary, cwd))
      await context.dispatch('initEngineOptions')
    },
    initEngineOptions (context) {
      const options = {
        // variant & 960 are handled separately and always set
        UCI_Variant: context.getters.variant,
        UCI_Chess960: context.state.board.is960(),

        // multi pv 5 is default
        MultiPV: 5
      }
      const stored = localStorage.getItem('engine' + context.state.activeEngine)
      if (stored) {
        Object.assign(options, JSON.parse(stored))
      }

      // this will update the settings in store & local storage
      context.dispatch('setEngineOptions', options)
    },
    setEngineOptions (context, payload) {
      if (context.getters.active) {
        context.dispatch('stopEngine')
      }
      context.dispatch('resetEngineData')
      for (const [name, value] of Object.entries(payload)) {
        checkOption(context.state.engineInfo.options, name, value)
        if (value !== undefined && value !== null) {
          if (!filteredSettings.includes(name)) {
            context.state.engineSettings[name] = value
          }
          engine.send(`setoption name ${name} value ${value}`)
        } else {
          engine.send(`setoption name ${name}`)
        }
      }
      localStorage.setItem('engine' + context.state.activeEngine, JSON.stringify(context.state.engineSettings))
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
              pvUCI: payload.pv,
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
    rounds (context, payload) {
      context.commit('rounds', payload)
    },
    async loadGame (context, payload) {
      context.commit('openedPGN', true)
      let variant = payload.game.headers('Variant').toLowerCase()
      if (variant === '') { // if no variant is given we assume it to be standard chess
        variant = 'chess'
      }

      if (!context.getters.variantOptions.revGet(variant)) {
        alert('This variant is currently not supported.')
        return
      }

      const gameInfo = {}
      for (const curVal of payload.game.headerKeys().split(' ')) {
        gameInfo[curVal] = payload.game.headers(curVal)
      }

      await context.dispatch('variant', variant)

      let fen = payload.game.headers('FEN')
      if (fen === '') { // if no FEN is given we use the standard starting FEN for this variant
        context.commit('newBoard')
        fen = context.state.startFen
      } else {
        context.commit('newBoard', { fen: fen })
      }
      await context.dispatch('fen', fen)

      context.commit('selectedGame', payload.game)
      context.commit('gameInfo', gameInfo)
      const moves = payload.game.mainlineMoves().split(' ')
      for (const num in moves) {
        if (num === 0) {
          context.commit('appendMoves', { move: moves[num], prev: undefined })
        } else {
          context.commit('appendMoves', { move: moves[num], prev: context.state.moves[num - 1] }) // TODO differentiate between alternative lines
        }
      }
      context.dispatch('updateBoard')
      context.dispatch('setEngineOptions', { UCI_Chess960: false })
      context.commit('openedPGN', false)
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
    },
    analysisMode (context, payload) {
      context.commit('analysisMode', payload)
    },
    openedPGN (context, payload) {
      context.commit('openedPGN', payload)
    },
    menuAtMove (context, payload) {
      context.commit('menuAtMove', payload)
    },
    displayMenu (context, payload) {
      context.commit('displayMenu', payload)
    },
    switchDarkMode (context) {
      context.commit('switchDarkMode')
    },
    evalPlotDepth (context, payload) {
      context.commit('evalPlotDepth', payload)
    }
  },
  getters: {
    currentMove (state) {
      return state.moves.filter(moves => moves.fen === state.fen)
    },
    getMoveByUCIAndPrev (state, uci, prev) {
      return (uci, prev) => state.moves.filter(moves => moves.uci === uci && moves.prev === prev)
      /* const moves = state.moves
      for (const i in moves) {
        if (moves[i].uci === uci && moves[i].prev === prev) {
          return moves[i]
        }
      }
      return null */
    },
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
    startFen (state) {
      return state.startFen
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
    availableEngines (state, getters) {
      return Object.entries(state.allEngines)
        .map(([name, info]) => ({ name, ...info }))
        .filter(engine => engine.variants && engine.variants.includes(getters.variant))
    },
    selectedEngine (state) {
      return { name: state.activeEngine, ...state.allEngines[state.activeEngine] }
    },
    engineBinary (state, getters) {
      return getters.selectedEngine.binary
    },
    engineName (state) {
      return state.engineInfo.name
    },
    engineAuthor (state) {
      return state.engineInfo.author
    },
    engineOptions (state) {
      return state.engineInfo.options.filter(({ name }) => !filteredSettings.includes(name))
    },
    engineSettings (state) {
      return state.engineSettings
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
    enginetime (state) {
      return state.enginetime
    },
    pv (state) {
      return state.multipv[0].pv
    },
    cpForWhite (state) {
      return calcForSide(state.multipv[0].cp, state.turn)
    },
    cpForWhiteStr (state, getters) {
      const currentMove = getters.currentMove[0]
      const { mate } = state.multipv[0]
      if (typeof mate === 'number') {
        return `#${calcForSide(mate, state.turn)}`
      } else if (currentMove && currentMove.name.includes('#')) {
        return state.turn ? '0-1' : '1-0'
      } else if (state.legalMoves.length === 0) {
        return '1/2-1/2'
      } else {
        return cpToString(getters.cpForWhite)
      }
    },
    cpForWhitePerc (state, getters) {
      const currentMove = getters.currentMove[0]
      const { mate } = state.multipv[0]
      if (typeof mate === 'number') {
        return (calcForSide(Math.sign(mate), state.turn) + 1) / 2
      } else if (currentMove && currentMove.name.includes('#')) {
        return state.turn ? 0 : 1
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
    firstMoves (state) {
      return state.firstMoves
    },
    mainFirstMove (state) {
      return state.mainFirstMove
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
    rounds (state) {
      return state.rounds
    },
    selectedGame (state) {
      return state.selectedGame
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
    isJanggi (state) {
      return state.janggiVariants.includes(state.variant)
    },
    isShogi (state) {
      return state.shogiVariants.includes(state.variant)
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
    },
    evalPlotDepth (state) {
      return state.evalPlotDepth
    },
    openedPGN (state) {
      return state.openedPGN
    },
    analysisMode (state) {
      return state.analysisMode
    },
    menuAtMove (state) {
      return state.menuAtMove
    },
    displayMenu (state) {
      return state.displayMenu
    },
    darkMode (state) {
      return state.darkMode
    }
  }
})

ffish.onRuntimeInitialized = () => {
  store.dispatch('initialize')
}

(async () => {
  // setup debug and error output
  engine.on('debug', (...msgs) => console.log('%c[Main Engine] Debug:', 'color: #82aaff; font-weight: 700;', ...msgs))
  engine.on('error', (...msgs) => console.error('%c[Main Engine]', 'color: #82aaff; font-weight: 700;', ...msgs))
  engine.on('eval-debug', (...msgs) => console.log('%c[Eval Engine] Debug:', 'color: #9580ff; font-weight: 700;', ...msgs))
  engine.on('eval-error', (...msgs) => console.error('%c[Eval Engine]', 'color: #9580ff; font-weight: 700;', ...msgs))

  // capture engine info
  engine.on('info', info => store.dispatch('updateMultiPV', info))
})()
