const request = require('request')
const unzip = require('unzip')
const fs = require('fs')
const walk = require('walk')
const asar = require('asar')
const { find } = require('lodash')
const rf = require('rimraf')

const releaseURL = 'https://downloads.slack-edge.com/releases'

function downloadClient(release) {
  console.log("Downloading the client")
  return new Promise((resolve, reject) => {
    console.log("Fetching", `${releaseURL}/${release}`)
    request(`${releaseURL}/${release}`)
      .on('error', reject)
      .on('end', resolve)
      .pipe(fs.createWriteStream(`./ClientExtracted/${release}`))
  })
}

function extractClient(release) {
  console.log("Extracting the Client")
  return new Promise((resolve, reject) => {
    try {
      const unzipExtractor = unzip.Extract({ path: './ClientExtracted/temp' })
      unzipExtractor.on('error', reject)
      unzipExtractor.on('close', resolve)
      fs.createReadStream(`./ClientExtracted/${release}`).pipe(unzipExtractor)
    } catch(e) {
      reject(e)
    }
  })
}

function findFiles() {
  console.log("Finding directory containing ASAR")
  return new Promise((resolve, reject) => {
    let files = []
    const walker = walk.walk('./ClientExtracted/temp')
    walker.on('file', (dir, stat, next) => {
      files.push(dir + '/' + stat.name);
      next()
    })
    walker.on('end', () => {
      let dir = find(files, file => file.endsWith('app.asar'))
      if (dir) return resolve(dir)
      return reject("Couldn't find dir")
    })
  })
}

function extractASAR(dir) {
  return new Promise(resolve => {
    console.log("Extracting ASAR")
    try {
      asar.extractAll(dir, './ClientExtracted') // synchronous
      resolve()
    } catch(e) {
      console.log("error?")
      resolve()
    }
  })
}

function cleanUp(name, version) {
  return new Promise((resolve, reject) => {
    console.log("Cleaning up files")
    const files = ['.cache', 'node_modules', 'temp', name]
    files.forEach(file => rf(`./ClientExtracted/${file}`, err => err ? reject(err) : void 0))

    fs.writeFile('./ClientExtracted/VERSION', version, resolve)
  })
}

function update({ release, version }) {
  return downloadClient(release)
    .then(() => extractClient(release))
    .then(findFiles)
    .then(extractASAR)
    .then(() => cleanUp(release, version))
    .then(Promise.resolve, Promise.reject)
}

module.exports = { update }
