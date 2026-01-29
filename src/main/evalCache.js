import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'

const dbPath = path.join(app.getPath('userData'), 'cache.db')
const db = new Database(dbPath, { verbose: console.log })
db.pragma('journal_mode = WAL')
export function createSchema () {
  const CREATE_EVAL_CACHE_TABLE = `
  CREATE TABLE IF NOT EXISTS eval_cache (
    position_key TEXT NOT NULL,
    engine_name TEXT NOT NULL,
    engine_version TEXT NOT NULL,
    depth INTEGER NOT NULL,
    cp_eval REAL,
    wdl_eval TEXT,
    pv_line TEXT,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (position_key, engine_name, engine_version)
  );
  `
  const ddl = db.prepare(CREATE_EVAL_CACHE_TABLE)
  const ddlInfo = ddl.run()
  console.log(ddlInfo)
}

export function insertEval (evaluation) {
  const engineName = evaluation.engineName.split(' ')[0]
  const engineVersion = evaluation.engineName.split(' ')[1]
  const wdlValue = Array.isArray(evaluation.wdl)
    ? JSON.stringify(evaluation.wdl)
    : null
  const insert = db.prepare(`
    INSERT INTO eval_cache (
    position_key, engine_name, engine_version, depth, cp_eval, wdl_eval, pv_line, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(position_key, engine_name, engine_version) DO UPDATE SET
    depth      = excluded.depth,
    cp_eval    = excluded.cp_eval,
    wdl_eval   = excluded.wdl_eval,
    pv_line    = excluded.pv_line,
    updated_at = excluded.updated_at
    WHERE excluded.depth > eval_cache.depth;
  `)
  return insert.run(
    evaluation.positionKey,
    engineName,
    engineVersion,
    evaluation.depth,
    evaluation.cp,
    wdlValue,
    evaluation.pv,
    evaluation.updatedAt
  )
}

export function getEval (positionKey) {
  const select = db.prepare(`
  SELECT * FROM eval_cache WHERE
  position_key = '${positionKey}'
  LIMIT 1
  ;
  `)
  return select.get()
}
