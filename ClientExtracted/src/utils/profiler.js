/**
 * @module Utilities
 */ /** for typedoc */

// NB: This can be included before electron-compile is set up, so it
// needs to be busted-old JS

const fs = require('fs');
const path = require('path');
const shouldProfile = process.env.SLACK_WHY_U_SO_SLOW !== undefined;

let profiler = null;

module.exports = {
  shouldProfile: () => shouldProfile,

  startProfiling: () => {
    profiler = profiler || require('@paulcbetts/v8-profiler');

    console.log("STARTING PROFILING");
    profiler.startProfiling();
  },

  stopProfiling: (suffix) => {
    profiler = profiler || require('@paulcbetts/v8-profiler');

    console.log("STOPPING CPU PROFILE");
    let profile = profiler.stopProfiling();

    console.log("TAKING SNAPSHOT");
    let heapSnapshot = process.type === 'renderer' ? null : profiler.takeSnapshot();
    let home = process.env.SLACK_HOME || process.env.HOME || process.env.USERPROFILE;

    profile.export()
      .pipe(fs.createWriteStream(path.join(home, `profile-${suffix}-${process.pid}.cpuprofile`)))
      .on('error', (e) => console.error(`Failed to create CPU profile: ${e.message}\n${e.stack}`))
      .on('finish', () => { console.log("DELETING PROFILE"); profiler.deleteAllProfiles(); });

    if (!heapSnapshot) return;

    heapSnapshot.export()
      .pipe(fs.createWriteStream(path.join(home, `heap-${suffix}-${process.pid}.heapsnapshot`)))
      .on('error', (e) => console.error(console.error(`Failed to create heap snapshot: ${e.message}\n${e.stack}`)))
      .on('finish', () => { console.log("DELETING SNAPSHOT"); heapSnapshot.delete(); });
  }
};
