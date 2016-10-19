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
  return new Promise((resolve, reject) => {
    let url = `https://${config.teamName}.slack.com`
    let urls = {}

    makeRequests([`${url}/admin`, `${url}/messages`]).then(([ page1, page2 ]) => {
      let $ = cheerio.load(page1 + page2) // lmao
      let js = chain($('script')).map(({ attribs: { src } }) => src && !src.match(jsRegex) ? src : null).compact().uniq().value()
      let css = chain($('link[type="text/css"]')).map(({ attribs: { href } }) => href && !href.match(/lato/) ? href : null).compact().uniq().value()
      urls = { js, css }
      return resolve(urls)
    }).catch(err => reject(`Error fetching URLS: ${err}`))
  })
}

function getScripts({ js, css }) {
  console.log("Getting scripts")
  return Promise.all([...js, ...css].map(url => {
    return new Promise((resolve, reject) => {
      request({ url }, (err, resp, body) => {
        if (!err && body) {
          let name = last(url.split('/'))
          return resolve({ name, body, type: name.endsWith('.js') ? 'js' : 'css' })
        } else return reject()
      })
    })
  }))
}

function writeToDisk(scripts) {
  console.log("Writing to disk")
  return Promise.all(scripts.map(({ name, body, type }) => {
    return new Promise(resolve => {
      fs.writeFile(`./scripts/${type}/${name}`, beautify[type](body, beautifyOptions), resolve)
    })
  }))
}

function getChanges() {
  console.log("Getting changes")
  return new Promise((resolve, reject) => {
    exec('git add ./ && git status --short', (err, stdout) => {
      if (!err) {
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
      if (!changes.length) return resolve('No new changes')
      let emoji = emojis[random(0, emojis.length - 1)]
      let msg = `${emoji} ${changes.join(', ')}`
      exec(`git commit -a -m "${msg}" && git push`, (err, stdout) => {
        console.log(err, stdout)
        if (err) return reject(err)
        resolve()
      })
    }).catch(reject)
  })

}

function startTheMagic() {
  getPageScripts().then(getScripts).then(writeToDisk).then(pushToGit).then(msg => {
    console.log(msg ? msg : "Successfully fetched changes and pushed to git (if any)")
  }).catch(err => console.err("Error while doing stuff", err))
}

function checkDirectories() {
  fs.stat('./scripts', err => {
    if (err) {
      fs.mkdir('./scripts', () => {
        fs.mkdir('./scripts/js')
        fs.mkdir('./scripts/css')
      })
    } else {
      fs.stat('./scripts/js', err => err ? fs.mkdir('./scripts/js') : void 0)
      fs.stat('./scripts/css', err => err ? fs.mkdir('./scripts/css'): void 0)
    }
  })
}

setInterval(() => {
  console.log("Checking for updates")
  //startTheMagic()
}, 1000 * 60 * 60)

console.log("Starting up")
startTheMagic()
checkDirectories()
