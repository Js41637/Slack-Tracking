const cluster = require('cluster')
const moment = require('moment');

// Override default log function to add timestamps
["log", "error"].forEach(function(method) {
  let oldMethod = console[method].bind(console)
  console[method] = function() { oldMethod.apply(console, [`<${moment().format('YY-MM-DD HH:mm:ssSS')}>`, ...arguments]) }
})

// Reboot the bot on crashes
if (cluster.isMaster) {
  cluster.fork()

  cluster.on("exit", function(worker, code) {
    if (code != 0) {
      console.error("Worker crashed or was rebooted! Spawning a replacement.")
      cluster.fork()
    }
  })
} else {
  module.exports = require('./main.js')
}
