# Slack-Tracking
Tracks code changes to Slack

## Setup
`npm i`  
`node ./slacktracker.js` or `npm run forever` or `node updater.js`

## Config
Create a config.js file in the root directory, requires valid cookies so you are logged in when we make the requests.
```
module.exports = {
  "teamName": "",
  "updateInterval": 90,
  "updateClient": true,
  "noPush": false,
  "dontPullLatest": false,
  "cookies": [
    "a=",
    "a-<a>=",
    "b="
  ]
}
```
