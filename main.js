const request = require('request')
const cheerio = require('cheerio')
const { chain, compact, map, last, random, uniq } = require('lodash') // eslint-disable-line
const beautify = require('js-beautify')
const fs = require('fs')
const { exec } = require('child_process')
const emojis = require('./emojis')
const config = require('./config')

const beautifyOptions = {
  indent_size: 2,
  end_with_newline: true
}

const headers = {
  Cookie: config.cookies.join(';')
}

const jsRegex = /(templates|analytics|beacon|required_libs)(.js|.php)/
const types = {
  js: 'Scripts',
  css: 'Styles'
}

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
  let URL = `https://${config.teamName}.slack.com`
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

function getChanges() {
  console.log("Getting changes")
  return new Promise((resolve, reject) => {
    exec('git add ./ && git status --short', (err, stdout) => {
      if (!err) {
        let changes = compact(map(stdout.split('\n'), c => c.trim()))
        console.log(`Got ${changes.length} changed files`)
        return resolve(changes)
      } else return reject(err)
    })
  })
}

function pushToGit() {
  console.log("Pushing to git")
  return getChanges().then(changes => {
    if (!changes.length) return Promise.resolve('No new changes')
    if (config.noPush) return Promise.resolve("Not pushing changes to Github")
    let emoji = emojis[random(0, emojis.length - 1)]
    let msg = `${emoji} ${changes.join(', ')}`
    exec(`git commit -a -m "${msg}" && git push`, (err, stdout) => {
      console.log(err, stdout)
      if (err) return Promise.reject(err)
      Promise.resolve()
    })
  }).catch(Promise.reject)
}

function startTheMagic() {
  getPageScripts().then(getScripts).then(writeToDisk).then(pushToGit).then(msg => {
    console.log(msg ? msg : "Successfully fetched changes and pushed to Github")
  }).catch(err => console.error("Error while doing stuff", err))
}

// Create directories if they don't exist
function checkDirectories() {
  fs.stat('./Scripts', err => err ? fs.mkdir('./Scripts') : void 0)
  fs.stat('./Styles', err => err ? fs.mkdir('./Styles') : void 0)
}

setInterval(() => {
  console.log("Checking for updates")
  startTheMagic()
}, 1000 * 60 * config.updateInterval) // Interval in minutes

console.log("Starting up")
if (!config || !config.teamName || !config.updateInterval || !config.cookies) {
  console.error("Invalid config")
  process.exit()
}

checkDirectories()
startTheMagic()
