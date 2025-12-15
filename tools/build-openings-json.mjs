import fs from 'node:fs';
import path from 'node:path';


// get all.tsv here: https://github.com/lichess-org/chess-openings/actions (check artifacts of latest run)
const inputFile = path.resolve('tools/chess-openings/all.tsv');

const text = fs.readFileSync(inputFile, 'utf8');

// lines: everything except header and empty lines
const lines = text
  .split('\n')
  .filter(l =>
    l.trim() &&
    !l.startsWith('#') &&      // comments
    !l.startsWith('eco\t')     // header
  );

const all = [];
const byEpd = {};

for (const line of lines) {
  const [eco, name, pgn, uci, epd] = line.split('\t');

  const obj = { eco, name, pgn, uci, epd };
  all.push(obj);

  // Also create sorted by epd because that's what we match opening against
  if (epd) {
    if (!byEpd[epd]) byEpd[epd] = [];
    byEpd[epd].push(obj);
  }
}

const outDir = path.resolve('src/shared');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'openings.json'),
  JSON.stringify({ list: all, byEpd }, null, 2),
  'utf8'
);

console.log(`Wrote ${all.length} openings, ${Object.keys(byEpd).length} EPD keys`);
