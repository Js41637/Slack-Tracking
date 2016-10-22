const request = require('request')
const cheerio = require('cheerio')
const { chain, compact, map, last, random, uniq } = require('lodash') // eslint-disable-line
const beautify = require('js-beautify')
const fs = require('fs')
const { exec } = require('child_process')
const emojis = require('./emojis')
const config = require('./config')
const clientUpdater = require('./clientUpdater')

if (!config || !config.teamName || !config.updateInterval || !config.cookies) {
  console.error("Invalid config")
  process.exit()
}

const ClientReleasesURL = 'http://slack-ssb-updates.global.ssl.fastly.net/releases_x64/RELEASES'
const URL = `https://${config.teamName}.slack.com`
const headers = { Cookie: config.cookies.join(';') }
const types = { js: 'Scripts', css: 'Styles' }
const beautifyOptions = { indent_size: 2, end_with_newline: true }
const jsRegex = /(templates|analytics|beacon|required_libs)(.js|.php)/
var pushing = false

function makeRequests(urls) {
  return Promise.all(urls.map(url => {
    return new Promise((resolve, reject) => {
      request({ url, headers }, (err, resp, body) => {
        if (!err && body) return resolve(body)
        else return reject("Error contacting slack")
      })
    })
  }))
}

function getPageScripts() {
  console.log("Getting page scripts")
  return makeRequests([`${URL}/admin`, `${URL}/messages`]).then(([ page1, page2 ]) => {
    let $ = cheerio.load(page1 + page2) // lmao
    let js = chain($('script')).map(({ attribs: { src: url } }) => url && !url.match(jsRegex) ? { url, type: 'js' } : null).compact().uniq().value()
    let css = chain($('link[type="text/css"]')).map(({ attribs: { href: url } }) => url && !url.match(/lato/) ? { url, type: 'css' } : null).compact().uniq().value()
    console.log(`Got ${js.length} scripts and ${css.length} styles`)
    return Promise.resolve([...js, ...css])
  }).catch(err => Promise.reject(`Error fetching URLS: ${err}`))
}

function getScripts(urls) {
  console.log("Getting scripts")
  return Promise.all(urls.map(({ url, type }) => {
    return new Promise((resolve, reject) => {
      request({ url }, (err, resp, body) => {
        if (!err && body) {
          let name = last(url.split('/'))
          return resolve({ name, body, type })
        } else return reject(`Error fetching script ${name}`)
      })
    })
  }))
}

function writeToDisk(scripts) {
  console.log("Writing to disk")
  return Promise.all(scripts.map(({ name, body, type }) => {
    return new Promise(resolve => fs.writeFile(`./${types[type]}/${name}`, beautify[type](body, beautifyOptions), resolve))
  }))
}

function getChanges(client) {
  console.log("Getting changes")
  return new Promise((resolve, reject) => {
    let what = client ? 'ClientExtracted/' : './ && git reset ClientExtracted/'
    exec(`git add ${what} && git diff --cached --name-status`, (err, stdout) => {
      if (!err) {
        let changes = compact(map(stdout.split('\n'), c => c.trim().replace('\t', ' ')))
        console.log(`Got ${changes.length} changed files`)
        return resolve(changes)
      } else return reject(err)
    })
  })
}

function pushToGit(client) {
  console.log("Pushing to git")
  pushing = true
  return getChanges(client).then(changes => {
    if (!changes.length) return Promise.resolve('No new changes')
    let emoji = emojis[random(0, emojis.length - 1)]
    let msg = `${emoji} ${changes.join(', ')}`
    let cmd = config.noPush ? `git commit -m "${msg}"` : `git commit -m "${msg}" && git push`
    exec(cmd, (err, stdout) => {
      console.log(err, stdout)
      pushing = false
      if (err) return Promise.reject(err)
      return `Sucessfully committed changed ${config.noPush ? 'but did not push' : 'and pushed'} to Github`
    })
  }).catch(err => {
    pushing = false
    Promise.reject(err)
  })
}

function startTheMagic() {
  getPageScripts().then(getScripts).then(writeToDisk).then(() => pushToGit()).then(msg => {
    console.log(msg)
  }).catch(err => console.error("Error while doing stuff", err))
}

function waitToPush() {
  setTimeout(function () {
    pushing ? waitToPush() : pushToGit(true)
  }, 2000);
}

function checkClientVersion() {
  request(ClientReleasesURL, (err, resp, body) => {
    if (!err && body) {
      let releases = compact(body.split('\n').map(rel => {
        if (rel.includes('delta')) return null
        let [ hash, release, size ] = rel.split(' ')
        return { hash, release, size, version: release.split('-')[1] }
      }))
      let latestRelease = last(releases)
      fs.readFile('./ClientExtracted/VERSION', 'utf8', (err, data) => {
        let currentVersion = err ? null : data
        if (currentVersion != latestRelease.version) {
          clientUpdater.update(latestRelease).then(() => {
            console.log("Finished updating client")
            pushing ? waitToPush() : pushToGit(true)
          })
        }
        else console.log("Versions are the same")
      })
    } else console.error("Error fetching client releases", err)
  })
}

// Create directories if they don't exist
function checkDirectories() {
  fs.stat('./Scripts', err => err ? fs.mkdir('./Scripts') : void 0)
  fs.stat('./Styles', err => err ? fs.mkdir('./Styles') : void 0)
  fs.stat('./ClientExtracted', err => err ? fs.mkdir('./ClientExtracted') : void 0)
}

setInterval(() => {
  console.log("Checking for updates")
  startTheMagic()
  checkClientVersion()
}, 1000 * 60 * config.updateInterval) // Interval in minutes

console.log("Starting up")

checkDirectories()
startTheMagic()
checkClientVersion()
