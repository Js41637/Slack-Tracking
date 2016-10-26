const request = require('request')
const unzip = require('unzip')
const fs = require('fs')
const walk = require('walk')
const asar = require('asar')
const { find } = require('lodash')
const rf = require('rimraf')

const releaseURL = 'https://downloads.slack-edge.com/releases'

function downloadClient(release) {
  return new Promise((resolve, reject) => {
    console.log("Downloading", `${releaseURL}/${release}`)
    request(`${releaseURL}/${release}`)
      .on('error', reject)
      .on('end', resolve)
      .pipe(fs.createWriteStream(`./ClientExtracted/${release}`))
  })
}

function extractClient(release) {
  return new Promise((resolve, reject) => {
    console.log("Extracting the Client")
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
  return new Promise((resolve, reject) => {
    console.log("Finding directory containing ASAR")
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
  return new Promise((resolve, reject) => {
    downloadClient(release)
      .then(() => extractClient(release))
      .then(findFiles)
      .then(extractASAR)
      .then(() => cleanUp(release, version))
      .then(resolve)
      .catch(reject)
  })
}

module.exports = { update }