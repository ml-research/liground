const path = require('path')
const fs = require('fs')
const https = require('https')
const os = require('os')
const chalk = require('chalk')

/**
 * Downloads a file to the given path.
 * @param {string} url URL to download form
 * @param {string} filePath Path to file
 * @returns
 */
function downloadFile (url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302) {
        // follow the redirect (we need this for downloading from github releases)
        downloadFile(res.headers.location, filePath).then(resolve).catch(reject)
        return
      } else if (res.statusCode !== 200) {
        reject(new Error(`Server responded with a status of ${res.statusCode} (${res.statusMessage})`))
        return
      }

      // pipe the result into the file
      const file = fs.createWriteStream(filePath)
      res.pipe(file)
        .on('finish', () => {
          file.close(() => resolve())
        })
        .on('error', (err) => {
          fs.unlink(file)
          reject(err)
        })
    })
  })
}

/**
 * Downloads an engine binary.
 * @param {string} fileName Name of binary to save
 * @param {Object} urlMap Map of binary URLs for each OS
 * @param {string} urlMap.mac URL for MacOS binary
 * @param {string} urlMap.win URL for Windows binary
 * @param {string} urlMap.linux URL for Linux binary
 */
async function downloadBinary (fileName, urlMap) {
  // find out which file to download
  let url
  const platform = os.platform()
  switch (platform) {
    case 'darwin':
      url = urlMap.mac
      break
    case 'win32':
      url = urlMap.win
      fileName += '.exe'
      break
    default:
      url = urlMap.linux
  }

  // check if no url available
  if (!url) {
    console.error(chalk.red('IMPORTANT:'), `No prebuilt binary of ${fileName} available for your current OS. Please build one yourself.`)
    return
  }
  console.log(`Downloading ${fileName} binary from ${url}...`)

  // download file
  const filePath = path.resolve(__dirname, '../engines', fileName)
  try {
    await downloadFile(url, filePath)
  } catch (err) {
    console.error(chalk.red(`Failed to download ${fileName}:`), err)
    return
  }

  // make the file executable
  if (platform !== 'win32') {
    await new Promise((resolve) => fs.chmod(filePath, '755', (err) => {
      if (err) throw err
      resolve()
    }))
  }
  console.log(`Download of ${fileName} completed!`)
}

downloadBinary('stockfish', {
  linux: 'https://github.com/niklasf/Stockfish/releases/download/fishnet-20200613/stockfish-x86_64',
  win: 'https://github.com/niklasf/Stockfish/releases/download/fishnet-20200613/stockfish-windows-amd64.exe',
  osx: 'https://github.com/niklasf/Stockfish/releases/download/fishnet-20200613/stockfish-osx-x86_64'
})

downloadBinary('multi-variant-stockfish', {
  linux: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-x86_64',
  win: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-windows-x86_64.exe',
  osx: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-osx-x86_64'
})

downloadBinary('fairy-stockfish', {
  linux: 'https://github.com/ianfab/Fairy-Stockfish/releases/download/fairy_sf_13/fairy-stockfish-largeboard_x86-64',
  win: 'https://github.com/ianfab/Fairy-Stockfish/releases/download/fairy_sf_13/fairy-stockfish-largeboard_x86-64.exe'
})
