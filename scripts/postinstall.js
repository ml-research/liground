const path = require('path')
const fs = require('fs')
const https = require('https')
const os = require('os')
const chalk = require('chalk')
const { spawn } = require('child_process')

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
          fs.unlink(filePath, () => {})
          reject(err)
        })
    })
  })
}

function inferKindFromExt (filePath) {
  const lower = path.extname(filePath).toLowerCase()
  if (lower === '.zip') return 'zip'
  if (lower === '.tar' || lower === '.tgz' || lower === '.tar.gz') return 'tar'
  return 'file'
}

function extractArchive (archivePath, kind) {
  const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'liground-engine-'))
  let cmd
  let args

  if (kind === 'zip') {
    if (process.platform === 'win32') {
      cmd = 'powershell'
      args = [
        '-NoLogo',
        '-NonInteractive',
        '-Command',
        `Expand-Archive -Path "${archivePath}" -DestinationPath "${extractDir}" -Force`
      ]
    } else {
      cmd = 'unzip'
      args = ['-q', archivePath, '-d', extractDir]
    }
  } else {
    cmd = 'tar'
    args = ['-xf', archivePath, '-C', extractDir]
  }

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(extractDir)
      } else {
        reject(new Error(`${cmd} exited with code ${code}`))
      }
    })
  })
}

/**
 * Copy the downloaded payload into place, extracting if needed.
 * @param {string} sourcePath downloaded file path
 * @param {string} destPath destination path
 * @param {string} kind archive kind hint (zip|tar|file)
 * @param {string} engineName engine name for fallback matching
 * @param {string} entry optional expected archive entry path
 */
async function placeBinary (sourcePath, destPath, kind, engineName, entry) {
  const inferredKind = kind || inferKindFromExt(sourcePath)
  if (inferredKind === 'file') {
    await fs.promises.copyFile(sourcePath, destPath)
    return
  }

  const extractDir = await extractArchive(sourcePath, inferredKind)
  if (!entry) {
    throw new Error(`Archive entry path must be provided for ${engineName}`)
  }
  const locatedBinary = path.join(extractDir, entry)
  if (!fs.existsSync(locatedBinary)) {
    throw new Error(`Could not locate ${engineName} binary (${entry}) after extracting ${sourcePath}`)
  }
  await fs.promises.copyFile(locatedBinary, destPath)
  fs.rmSync(extractDir, { recursive: true, force: true })
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
  let target
  const platform = os.platform()
  switch (platform) {
    case 'darwin':
      target = urlMap.mac
      break
    case 'win32':
      target = urlMap.win
      break
    default:
      target = urlMap.linux
  }

  // check if no url available
  if (!target) {
    console.error(chalk.red('IMPORTANT:'), `No prebuilt binary of ${fileName} available for your current OS. Please build one yourself.`)
    return
  }
  const url = typeof target === 'string' ? target : target.url
  const kind = typeof target === 'object' ? target.kind : undefined
  const entry = typeof target === 'object' ? target.entry : undefined
  console.log(`Downloading ${fileName} binary from ${url}...`)

  // download file
  const downloadPath = path.join(os.tmpdir(), `${fileName}-${Date.now()}${path.extname(url).split('?')[0]}`)
  try {
    await downloadFile(url, downloadPath)
  } catch (err) {
    console.error(chalk.red(`Failed to download ${fileName}:`), err)
    return
  }

  try {
    const destName = platform === 'win32' ? `${fileName}.exe` : fileName
    const destPath = path.resolve(__dirname, '../engines', destName)
    await fs.promises.mkdir(path.dirname(destPath), { recursive: true })
    await placeBinary(downloadPath, destPath, kind, fileName, entry)

    // make the file executable
    if (platform !== 'win32') {
      await fs.promises.chmod(destPath, '755')
    }
    console.log(`Download of ${fileName} completed!`)
  } catch (err) {
    console.error(chalk.red(`Failed to prepare ${fileName}:`), err)
  } finally {
    fs.rm(downloadPath, { force: true }, () => {})
  }
}

downloadBinary('stockfish', {
  linux: { url: 'https://github.com/official-stockfish/Stockfish/releases/download/sf_17/stockfish-ubuntu-x86-64-avx2.tar', kind: 'tar', entry: 'stockfish/stockfish-ubuntu-x86-64-avx2' },
  win: { url: 'https://github.com/official-stockfish/Stockfish/releases/download/sf_17/stockfish-windows-x86-64-avx2.zip', kind: 'zip', entry: 'stockfish/stockfish-windows-x86-64-avx2.exe' },
  mac: { url: 'https://github.com/official-stockfish/Stockfish/releases/download/sf_17/stockfish-macos-x86-64-avx2.tar', kind: 'zip', entry: 'stockfish/stockfish-macos-universal' }
})

downloadBinary('multi-variant-stockfish', {
  linux: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-x86_64',
  win: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-windows-x86_64.exe',
  mac: 'https://github.com/ddugovic/Stockfish/releases/download/variant_sf_10/stockfish-osx-x86_64'
})

downloadBinary('fairy-stockfish', {
  linux: 'https://github.com/fairy-stockfish/Fairy-Stockfish/releases/download/fairy_sf_14_0_1_xq/fairy-stockfish-largeboard_x86-64',
  win: 'https://github.com/fairy-stockfish/Fairy-Stockfish/releases/download/fairy_sf_14_0_1_xq/fairy-stockfish-largeboard_x86-64.exe'
})
