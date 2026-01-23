import path from 'path'
import { app } from 'electron'
import Database from 'better-sqlite3'
import { store } from '../renderer/store'

const dbPath = path.join(app.getPath('userData'), 'cache.db')
const db = new Database('cache.db', { verbose: console.log })
db.pragma('journal_mode = WAL')

export function createSchema () {
    const CREATE_EVAL_CACHE_TABLE = `
    CREATE TABLE IF NOT EXISTS eval_cache (
    position_key TEXT PRIMARY KEY,
    engine_name TEXT NOT NULL,
    engine_version TEXT NOT NULL,
    depth INTEGER NOT NULL,
    cp_eval REAL,
    wdl_eval INTEGER,
    pv_line TEXT,
    updated_at INTEGER NOT NULL
    );
    `;
    const ddl = db.prepare(CREATE_EVAL_CACHE_TABLE);
    const ddlInfo = ddl.run()
    db.exec("INSERT OR IGNORE INTO eval_cache VALUES ('abcdef', 'stockfish', '1.0', '20', '10.3','988', '4.e3 e7', '1313231')")
}

export function insertEval (evaluation) {
    engineName = evaluation.engineName.split(" ")[0]
    engineVersion = evaluation.engineName.split(" ")[1]
    const insert = db.prepare(`
    INSERT INTO eval_cache VALUES (
    '${evaluation.positionKey}',
    '${engineName}',
    '${engineVersion}',
    '${evaluation.depth}',
    '${evaluation.cp}',
    '${evaluation.pv}',
    '${evaluation.updatedAt}'
    );
    `);
    const insertInfo = insert.run() 
}

export function getEval (position_key) {
    const select = db.prepare(`
    SELECT LIMIT 1 FROM eval_cache WHERE
    position_key = '${evaluation.positionKey}'
    ;
    `);
    const result = select.get()
    return result
}