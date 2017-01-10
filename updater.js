const request = require('request')
const cheerio = require('cheerio')
const { chain, compact, map, last, random, uniq, truncate, find, sortBy } = require('lodash') // eslint-disable-line
const beautify = require('js-beautify')
const fs = require('fs')
const { exec } = require('child_process')
const { CLIEngine } = require('eslint')
const striptags = require('striptags');
const toMarkdown = require('to-markdown');
const emojis = require('./emojis')
const config = require('./config')
const clientUpdater = require('./clientUpdater')

if (!config || !config.teamName || !config.updateInterval || !config.cookies) {
  console.error("Invalid config")
  process.exit()
}

const clientReleasesURL = 'http://slack-ssb-updates.global.ssl.fastly.net/releases_beta_x64/RELEASES'
const URL = `https://${config.teamName}.slack.com`
const headers = { Cookie: config.cookies.join(';') } // Cookies ;)
const types = { js: 'Scripts', css: 'Styles', md: 'Random' }
const beautifyOptions = { indent_size: 2, end_with_newline: true }
const jsRegex = /(analytics|beacon|required_libs)(.js|.php)/

const eslint = new CLIEngine({
  envs: ["browser"],
  useEslintrc: false,
  fix: true,
  rules: {
    semi: ['error', 'always'] // Always error on missing semicolons
  }
})

// Downloads the pages and returns their HTML, requires valid session cookies
function getPageBodys(urls) {
  return Promise.all(urls.map(url => {
    return new Promise((resolve, reject) => {
      request({ url, headers }, (err, resp, body) => {
        if (!err && body) return resolve(body)
        return reject("Error contacting slack")
      })
    })
  }))
}

// Find all the <script> and <link> sources we want from the pages we downloaded
function getPageScripts() {
  console.log("Getting page scripts")
  return getPageBodys([`${URL}/admin`, `${URL}/messages`]).then(([ page1, page2 ]) => {
    let $ = cheerio.load(page1 + page2) // lmao
    let js = chain($('script')).map(({ attribs: { src: url } }) => {
      if (url && url.match(/^\/templates.php/)) return { url: `https://slack.com${url},billing,signup`, type: 'js' }
      else if (url && !url.match(jsRegex) && url.match(/^https?/)) return { url, type: 'js' }
  }).compact().uniq().value()
    let css = chain($('link[type="text/css"]')).map(({ attribs: { href: url } }) => (url && !url.match(/lato/) && url.match(/^https?/)) ? { url, type: 'css' } : null).compact().uniq().value()
    console.log(`Got ${js.length} scripts and ${css.length} styles`)
    return Promise.resolve([...js, ...css])
  }).catch(err => Promise.reject(`Error fetching URLS: ${err}`))
}

// Download all the scripts we found (js & css)
function getIndividualScripts(urls) {
  console.log("Getting scripts")
  return Promise.all(urls.map(({ url, type }) => {
    return new Promise((resolve, reject) => {
      request({ url }, (err, resp, body) => {
        if (err || !body) return reject(`Error fetching script ${url}, ${err}`)
        let name = last(url.split('/')).split('?')[0].replace('.php', '.js')
        return resolve({ name, body, type })
      })
    })
  }))
}

// Parses the Javascript file we downloaded containing minified HTML templates
//  and seperates them into seperate files
function processTemplates(scripts) {
  return new Promise((resolve, reject) => {
    let temps = find(scripts, { name: 'templates.js' })
    if (!temps) return resolve(scripts)
    console.log("Got templates")
    let regex = /TS.raw_templates\['(\w+)'\] ?= ?"(.+)";/g
    let templates = []
    let match
    try {
      while ((match = regex.exec(temps.body)) !== null) {
        templates.push({ name: match[1], body: match[2] })
      }
    } catch(e) {
      return reject("Error processing templates")
    }

    // Write each template to the disk
    Promise.all(templates.map(template => {
      return new Promise(resolve => {
        let body = template.body.replace(/\\n/g, '\n').replace(/\\t/g, '  ').replace(/\\"/g, '"').replace(/\\\//g, '/')
        fs.writeFile(`./Templates/${template.name}.html`, body, resolve)
      })
    })).then(() => resolve(scripts))
  })
}

// Fetches Slacks Terms Of Service and converts it to markdown
function getTerms(scripts) {
  return new Promise((resolve, reject) => {
    console.log("Fetching TOS")
    request('http://slack.com/terms-of-service', (err, resp, body) => {
      if (err || !body) return reject(`Error: ${err || 'No body'}`)
      let $ = cheerio.load(body)
      let html = $('#page_contents > div')
      if (!html) return reject("Can't find da terms")
      html.find('style').remove() // striptags pls
      let terms = toMarkdown(striptags(html.html(), '<p><b><strong><h1><h2><h3><h4>'))
      scripts.push({ name: 'TOS.md', body: terms, type: 'md'})
      return resolve(scripts)
    })
  })
}

// Write all scripts and styles and stuff to disk, overwriting existing
function writeToDisk(scripts) {
  console.log("Writing to disk")
  return Promise.all(scripts.map(({ name, body, type }) => {
    return new Promise(resolve => {
      body = (type == 'js' || type == 'css') ? beautify[type](body, beautifyOptions) : body
      fs.writeFile(`./${types[type]}/${name}`, body, resolve)
    })
  }))
}

// Lints all the JS code in the ./Scripts directory to add missing semicolons so
//  we get nice diffs, this can take up to 2 minutes to complete.
function lintCode() {
  return new Promise((resolve) => { // synchronous
    console.log("Linting code")
    let report = eslint.executeOnFiles(['./Scripts'])
    CLIEngine.outputFixes(report)
    return resolve()
  })
}

// Get list of currently changed files and seperate script commits from client commits
function getChanges(client) {
  console.log("Getting changes")
  return new Promise((resolve, reject) => {
    exec(client ? 'git reset ./ && git add ClientExtracted/' : 'git add ./ && git reset ClientExtracted/', err => {
      if (err) return reject(err)
      exec(`git diff --cached --name-status`, (error, stdout) => {
        if (error) return reject(error)
        let changes = chain(stdout.split('\n')).map(c => c.trim().replace('\t', ' ')).compact().sortBy(change => change.match(/A [A-z/-]+\.\w+/)).value()
        console.log(`Got ${changes.length} changed files`)
        return resolve(changes)
      })
    })
  })
}

// Create a commit and push to Github
function pushToGit(client) {
  return new Promise((resolve, reject) => {
    console.log("Preparing to push to Github")
    getChanges(client).then(changes => {
      if (!changes.length) return resolve('No new changes')
      if (changes.indexOf("Unstaged changes after reset") >= 0) {
        console.error("Error: Git fucked up")
        return exec('git reset HEAD --hard', () => process.exit())
      }
      let emoji = emojis[random(0, emojis.length - 1)]
      let msg = `${emoji} ${truncate(changes.join(', ').replace(/ClientExtracted(\/src)?/g, 'Client'), { length: 1000 })}`
      let cmd = `git commit -m "${msg}" ${config.noPush ? '' : '&& git push'}`
      exec(cmd, (err, stdout) => {
        console.log(err, stdout)
        if (err) return reject(err)
        return resolve(`Sucessfully committed changed ${config.noPush ? 'but did not push' : 'and pushed'} to Github`)
      })
    }).catch(reject)
  })
}

// Check if Slack has released a new version of its client and if it has, download it
function checkClientVersion() {
  request(clientReleasesURL, (err, resp, body) => {
    if (err || !body) return console.error("Error fetching client releases", err)
    let releases = compact(body.split('\n').map(rel => {
      if (rel.includes('delta')) return null
      let [ hash, release, size ] = rel.split(' ')
      return { hash, release, size, version: release.split('-')[1] }
    }))
    let latestRelease = last(releases)
    fs.readFile('./ClientExtracted/VERSION', 'utf8', (err, data) => {
      let currentVersion = err ? null : data
      if (currentVersion == latestRelease.version) return console.log("Slack Client hasn't updated")
      else clientUpdater.update(latestRelease).then(() => pushToGit(true)).catch(console.error)
    })
  })
}

function pullLatestChanges() {
  return new Promise((resolve, reject) => {
    console.log("Pulling latest changes, if any")
    if (config.dontPullLatest) return resolve()
    exec('git rev-parse HEAD', (err, lastCommit) => {
      if (err || !lastCommit) return reject(`Error fetching last commit, ${err}`)
      exec('git pull', (err, stdout) => {
        if (!err && stdout && stdout.startsWith('Updating')) return process.exit(1)
        if (!err && stdout && stdout.includes('Already up-to-date')) return resolve()
        else {
          console.error(`Error while updating, reverting! Err: ${err} \n STDOUT: ${stdout}`)
          exec(`git reset ${lastCommit} --hard`, () => process.exit())
        }
      })
    })
  })
}

// Start The Magic
function startTheMagic() {
  pullLatestChanges()
    .then(getPageScripts)
    .then(getIndividualScripts)
    .then(processTemplates)
    .then(getTerms)
    .then(writeToDisk)
    .then(lintCode)
    .then(() => pushToGit())
    .then(console.log)
    .catch(err => {
      console.error("Error while doing stuff", err)
      exec(`git reset --hard`, () => process.exit())
    })
}

// Create directories if they don't exist
function checkDirectories() {
  fs.stat('./Scripts', err => err ? fs.mkdir('./Scripts') : void 0)
  fs.stat('./Styles', err => err ? fs.mkdir('./Styles') : void 0)
  fs.stat('./Templates', err => err ? fs.mkdir('./Templates') : void 0)
  fs.stat('./ClientExtracted', err => err ? fs.mkdir('./ClientExtracted') : void 0)
  fs.stat('./Random', err => err ? fs.mkdir('./Random') : void 0)
}

// Check scripts and client for updates every x mins
setInterval(() => {
  console.log("Checking for updates")
  startTheMagic()
  checkClientVersion()
}, 1000 * 60 * config.updateInterval) // Interval in minutes

console.log("Starting up")

// Init
checkDirectories()
if (!config.onlyClient) {
  startTheMagic()
}
if (config.updateClient) {
  checkClientVersion()
}
