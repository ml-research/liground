import openingsData from './openings.json'

const byEpd = openingsData.byEpd || {}

// FEN -> EPD (nur die ersten 4 Felder der FEN)
export function fenToEpd (fen) {
  const parts = fen.trim().split(/\s+/)
  return parts.slice(0, 4).join(' ')
}

export function findOpeningsForFen (fen) {
  const epd = fenToEpd(fen)
  return byEpd[epd] || []
}

export function findBestOpeningForFen (fen) {
  const candidates = findOpeningsForFen(fen)
  if (!candidates.length) return null
  return candidates.reduce((best, cur) =>
    cur.pgn.split(' ').length > best.pgn.split(' ').length ? cur : best
  )
}
