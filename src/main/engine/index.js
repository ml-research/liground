import { spawn } from 'child_process'
import { ipcMain } from 'electron'
import Engines from './engines'
import EngineDriver from './driver'

/** @type {EngineDriver} */
let engine

// eslint-disable-next-line prefer-const
let binary = Engines.stockfish

const events = ['option']

function setupEngine (child, reply) {
  engine = new EngineDriver(child)
  for (const event of events) {
    engine.on(event, (...args) => reply(`engine-${event}`, ...args))
  }
  reply('active')
}

ipcMain.on('run', event => {
  event.reply('debug', 'Running engine')
  const child = spawn(binary, []).on('error', err => {
    event.reply('error', err)
  })
  if (typeof child.pid === 'number') {
    setupEngine(child, event.reply)
  }
})

ipcMain.on('cmd', (event, cmd) => {
  cmd = cmd.trim()
  event.reply('debug', `Queueing command "${cmd}"`)
  if (engine) {
    engine.queue(cmd)
  } else {
    event.reply('error', 'Engine not running')
  }
})
