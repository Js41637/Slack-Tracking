const request = require('request')
const unzip = require('unzip')
const fs = require('fs')
const walk = require('walk')
const asar = require('asar')
const { find } = require('lodash')
const rf = require('rimraf')
const config = require('./config')

const releaseURL = 'https://slack-ssb-updates.global.ssl.fastly.net/releases_beta_x64'

function downloadClient(release) {
  return new Promise((resolve, reject) => {
    // Helpful for testing, don't download new version if we already have a local copy
    if (config.useExistingFile && fs.existsSync(`./ClientTemp/${release}`)) {
      console.log("[Client] Using existing file")
      return resolve()
    }
    console.log("[Client] Downloading", `${releaseURL}/${release}`)
    const r = request(`${releaseURL}/${release}`)
    r.pause() // Start the download paused so it doesn't create an empty file on error
    r.on('error', err => { return reject(`Request error ${err}`) })
    r.on('end', resolve)
    r.on('response', resp => {
      // If we get a 200 response, create a WriteStream and resume the download.
      if (resp.statusCode != 200) return reject(`[Client] Error downloading client, got status code ${resp.statusCode}`)
      if (!fs.existsSync('./ClientTemp')) fs.mkdirSync('./ClientTemp')
      r.pipe(fs.createWriteStream(`./ClientTemp/${release}`))
      r.resume()
    })
  })
}

// Unzips file we download
function extractClient(release) {
  return new Promise((resolve, reject) => {
    console.log("[Client] Extracting the Client")
    try {
      const unzipExtractor = unzip.Extract({ path: './ClientTemp/files' })
      unzipExtractor.on('error', reject)
      unzipExtractor.on('close', resolve)
      fs.createReadStream(`./ClientTemp/${release}`).pipe(unzipExtractor)
    } catch(e) {
      reject(e)
    }
  })
}

// Goes through all the unziped files and finds the directory containing the app.asar which contains the Slack Client
function findFiles() {
  return new Promise((resolve, reject) => {
    console.log("[Client] Finding directory containing ASAR")
    let files = []
    const walker = walk.walk('./ClientTemp/files')
    walker.on('file', (dir, stat, next) => {
      files.push(dir + '/' + stat.name);
      next()
    })
    walker.on('end', () => {
      let dir = find(files, file => file.endsWith('app.asar'))
      if (dir) return resolve(dir)
      return reject("[Client] Couldn't find dir")
    })
  })
}

// Extracts the .asar file
function extractASAR(dir) {
  return new Promise((resolve, reject) => {
    console.log("[Client] Extracting ASAR")
    try {
      asar.extractAll(dir, './ClientExtracted') // synchronous
      resolve()
    } catch(e) {
      console.log("[Client] Error extracting ASAR", e)
      reject()
    }
  })
}

// Removes temp files, prettifies package.json and bumps version
function cleanUp(name, version) {
  return new Promise((resolve, reject) => {
    console.log("[Client] Cleaning up files")
    const files = ['./ClientExtracted/.cache', './ClientExtracted/node_modules', './ClientTemp']
    files.forEach(file => rf(file, err => {
      if (err) return reject(err)
    }))
    try { // Fix minified package.json
      var packageJSON = JSON.parse(fs.readFileSync('./ClientExtracted/package.json'))
      fs.writeFileSync('./ClientExtracted/package.json', JSON.stringify(packageJSON, null, 2))
    } catch (e) {
      console.warn("[Client] Error parsing package JSON")
    }

    fs.writeFile('./ClientExtracted/VERSION', version, resolve)
  })
}

// Remove existing ClientExtracted folder to remove any deleted files in the new Client
function cleanDaSlate(dir) {
  return new Promise((resolve, reject) => {
    console.log("[Client] Removing ClientExtracted folder")
    rf('./ClientExtracted', err => {
      if (err) return reject(err)
      resolve(dir) // dir is the dir containing ASAR we are forwarding to da next function
    })
  })
}

// Starts da client updater
function update({ release, version }) {
  return new Promise((resolve, reject) => {
    downloadClient(release)
      .then(() => extractClient(release))
      .then(findFiles)
      .then(cleanDaSlate)
      .then(extractASAR)
      .then(() => cleanUp(release, version))
      .then(resolve)
      .catch(reject)
  })
}

module.exports = { update }
