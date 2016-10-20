# Slack-Tracking
Tracks code changes to Slack

## Setup
`npm i`  
`node ./slacktracker.js` or `npm run forever`

## Config
Create a config.js file in the root directory, requires valid cookies so you are logged in when we make the requests.
```
module.exports = {
  "teamName": "",
  "updateInterval": 90,
  "noPush": false,
  "cookies": [
    "a=",
    "a-<a>=",
    "b="
  ]
}
```
