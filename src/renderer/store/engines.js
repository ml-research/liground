import path from 'path'
import logoStockfish from '../assets/images/engines/stockfish.png'
import logoStockfishBlue from '../assets/images/engines/stockfish_blue.png'
import logoStockfishPurple from '../assets/images/engines/stockfish_purple.png'

const enginePath = path.resolve(
  process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '../../../') : process.resourcesPath,
  'engines'
)

/**
 * Resolve the path to an engine binary.
 * @param {string} name binary file name
 */
function resolveBinary (name) {
  return path.resolve(enginePath, `${name}${process.platform === 'win32' ? '.exe' : ''}`)
}

// first engine in the list has highest priority for default engine selection
export default {
  'Stockfish 12': {
    binary: resolveBinary('stockfish'),
    cwd: enginePath,
    logo: logoStockfish,
    variants: [
      'chess',
      'antichess',
      'atomic',
      'crazyhouse',
      'horde',
      'kingofthehill',
      'racingkings',
      '3check',
      'giveaway'
    ]
  },
  'Multi-Variant-Stockfish 10': {
    binary: resolveBinary('multi-variant-stockfish'),
    cwd: enginePath,
    logo: logoStockfishBlue,
    variants: [
      'chess',
      'giveaway',
      'atomic',
      'crazyhouse',
      'extinction',
      'grid',
      'horde',
      'kingofthehill',
      'losers',
      'racingkings',
      '3check',
      'twokings',
      'suicide',
      'bughouse',
      'displacedgrid',
      'loop',
      'placement',
      'slippedgrid',
      'twokingssymmetric'
    ]
  },
  'Fairy Stockfish 13': {
    binary: resolveBinary('fairy-stockfish'),
    cwd: enginePath,
    logo: logoStockfishPurple,
    variants: [
      '3check',
      '5check',
      'ai-wok',
      'almost',
      'amazon',
      'antichess',
      'armageddon',
      'asean',
      'ataxx',
      'breakthrough',
      'bughouse',
      'cambodian',
      'capablanca',
      'capahouse',
      'caparandom',
      'centaur',
      'chancellor',
      'chess',
      'chessgi',
      'chigorin',
      'clobber',
      'clobber10',
      'codrus',
      'courier',
      'crazyhouse',
      'dobutsu',
      'embassy',
      'euroshogi',
      'extinction',
      'fairy',
      'fischerandom',
      'gardner',
      'giveaway',
      'gorogoro',
      'gothic',
      'grand',
      'hoppelpoppel',
      'horde',
      'janggi',
      'janggicasual',
      'janggimodern',
      'janggitraditional',
      'janus',
      'jesonmor',
      'judkins',
      'karouk',
      'kinglet',
      'kingofthehill',
      'knightmate',
      'koedem',
      'kyotoshogi',
      'loop',
      'losalamos',
      'losers',
      'makpong',
      'makruk',
      'manchu',
      'micro',
      'mini',
      'minishogi',
      'minixiangqi',
      'modern',
      'newzealand',
      'nocastle',
      'normal',
      'placement',
      'pocketknight',
      'racingkings',
      'seirawan',
      'shako',
      'shatar',
      'shatranj',
      'shogi',
      'shouse',
      'sittuyin',
      'suicide',
      'supply',
      'threekings',
      'xiangqi'
    ]
  }
}
