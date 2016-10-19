const request = require('request')
const cheerio = require('cheerio')
const { compact, map, last, random } = require('lodash')
const beautify = require('js-beautify').js_beautify
const fs = require('fs')
const { exec } = require('child_process')
const emojis = require('./emojis')
const config = require('./config')

const beautifyOptions = {
  indent_size: 2,
  end_with_newline: true
}

function getPageScripts() {
  console.log("Getting page scripts")
  return new Promise((resolve, reject) => {
    let url = `https://${config.teamName}.slack.com/admin`
    let headers = {
      Cookie: config.cookies.join(';')
    }
    request({ url, headers }, (err, resp, body) => {
      if (!err && body) {
        console.log("Got ")
        let $ = cheerio.load(body)
        let urls = compact(map($('script'), ({ attribs: { src } }) => src && !src.match(/(analytics|beacon|required_libs).js/) ? src : null))
        console.log("Got", urls.length, "urls")
        return resolve(urls)
      } else return reject("Error contacting slack")
    })
  })
}

function getScripts(urls) {
  console.log("Getting scripts")
  return Promise.all(urls.map(url => {
    return new Promise((resolve, reject) => {
      request({ url }, (err, resp, body) => {
        if (!err && body) {
          return resolve({ name: last(url.split('/')), body })
        } else return reject()
      })
    })
  }))
}

function writeToDisk(scripts) {
  console.log("Writing to disk")
  return Promise.all(scripts.map(({ name, body }) => {
    return new Promise(resolve => {
      fs.writeFile(`./scripts/${name}`, beautify(body, beautifyOptions), resolve)
    })
  }))
}

function getChanges() {
  console.log("Getting changes")
  return new Promise((resolve, reject) => {
    exec('git add ./ && git status --short', (err, stdout) => {
      if (!err && stdout) {
        let changes = compact(map(stdout.split('\n'), c => c.trim().replace(/ scripts\//, '')))
        return resolve(changes)
      } else return reject(err)
    })
  })
}

function pushToGit() {
  console.log("Pushing to git")
  return new Promise((resolve, reject) => {
    getChanges().then(changes => {
      let emoji = emojis[random(0, emojis.length - 1)]
      let msg = `${emoji} ${changes.join(', ')}`
      exec(`git commit -a -m "${msg}" && git push`, (err) => {
        console.log("Executed command")
        if (err) return reject(err)
        resolve()
      })
    }).catch(reject)
  })

}

function startTheMagic() {
  getPageScripts().then(getScripts).then(writeToDisk).then(pushToGit).then(() => {
    console.log("Successfully fetched changes and pushed to git (if any)")
  }).catch(err => console.err("Error while doing stuff", err))
}

setInterval(() => {
  console.log("Checking for updates")
  startTheMagic()
}, 1000 * 60 * 60 * 24)

console.log("Starting up")
startTheMagic()
