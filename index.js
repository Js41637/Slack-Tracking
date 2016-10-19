const request = require('request')
const cheerio = require('cheerio')
const { compact, map, last } = require('lodash')
const beautify = require('js-beautify').js_beautify
const fs = require('fs')
const config = require('./config')
const { exec } = require('child_process')

const beautifyOptions = {
  indent_size: 2,
  end_with_newline: true
}

function getPageScripts() {
  return new Promise((resolve, reject) => {
    let url = `https://${config.teamName}.slack.com/admin`
    let headers = {
      Cookie: config.cookies.join(';')
    }
    request({ url, headers }, (err, resp, body) => {
      if (!err && body) {
        let $ = cheerio.load(body)
        let urls = compact(map($('script'), ({ attribs: { src } }) => src && !src.match(/(analytics|beacon|required_libs).js/) ? src : null))
        return resolve(urls)
      } else return reject("Error contacting slack")
    })
  })
}

function getScripts(urls) {
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
  return Promise.all(scripts.map(({ name, body }) => {
    return new Promise(resolve => {
      fs.writeFile(`./scripts/${name}`, beautify(body, beautifyOptions), resolve)
    })
  }))
}

function pushToGit() {

}

getPageScripts().then(getScripts).then(writeToDisk).then(() => {
  console.log("FINISHED")
})
