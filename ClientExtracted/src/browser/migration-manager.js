import transform from 'lodash.transform';
import {pick} from '../utils/pick';
import path from 'path';
import fs from 'fs';
import {session} from 'electron';

import {getInitialsOfName} from '../reducers/teams-reducer';
import {logger} from '../logger';
import {p} from '../get-path';
import CookieParser from './safari-cookies';

/**
 * This class provides ways to parse data from pre-2.0 versions of the Electron
 * client or from the MacGap client, during a one-time migration.
 */
class MigrationManager {
  /**
   * The first time the app is run on Mac, we'll use a native node module to
   * retrieve the team list and auth tokens as a JSON blob.
   *
   * @param  {Boolean}  isDevMode  True if running in devMode, false if production
   * @return {Array}               An array of team objects
   */
  async getMacGapData(isDevMode) {
    if (process.platform !== 'darwin') {
      logger.error('Should only be used on Mac');
      return null;
    }

    let extraLocations = [];
    if (isDevMode) {
      logger.info("Adding debug MacGap location");
      extraLocations.push(p`${'home'}/Desktop/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack`);
    }

    logger.info("Starting MacGap migration!");
    try {
      let macGapPrefReader = require('@slack/macgap-pref-reader');
      let tokenFiles = this.findTokenFiles(extraLocations);

      if (!tokenFiles) {
        logger.info("Couldn't find token file, assuming there are no MacGap settings to migrate");
        return null;
      }

      // Run through the list of token files and their associated team data.
      // The tokenFiles array is sorted in preference order (i.e. 'most likely
      // to be correct' file is first), so if we grab something valid out of it
      // we want to stick with it.
      logger.info(`Files to try: ${JSON.stringify(tokenFiles)}`);
      let teamList = tokenFiles.reduce((acc, x) => {
        if (acc) return acc;

        // NB: I hate this so bad. Tokens are stored in the Preference file, but
        // NSUserDefaults has no way to read any pref file other than its own.
        // So, we need to pass in their pref file and basically import it into
        // our own
        let theirPrefFile = p`${path.dirname(x)}/../../Preferences/com.tinyspeck.slackmacgap.plist`;
        if (!fs.existsSync(theirPrefFile)) return acc;

        logger.info(`Trying token file ${x}`);
        let macGapJson = macGapPrefReader.returnPrefInformation(
          path.dirname(x),
          path.basename(x),
          theirPrefFile);

        let list = JSON.parse(macGapJson);
        logger.info(`MacGap JSON: ${macGapJson}`);
        if (!list || list.length < 1) return null;

        return list;
      }, null);

      await this.migrateMacGapCookiesToSession(tokenFiles);

      if (!teamList) {
        logger.error("Found MacGap files, but none were parsable");
        return null;
      }

      let teams = this.parseTeamList(teamList);
      let teamsArray = Object.keys(teams).map((teamId) => teams[teamId]);

      logger.info(`Teams from MacGap: ${JSON.stringify(teamsArray)}`);
      return teamsArray;
    } catch (e) {
      logger.error(`MacGap teams migration failed: ${e.stack}`);
      return null;
    }
  }

  parseTeamList(teamList) {
    return transform(teamList, (teams, teamEntry) => {
      let team = pick(teamEntry, 'name', 'id', 'team_id', 'team_name', 'team_url', 'theme', 'icons');
      team.initials = getInitialsOfName(team.team_name);

      teams[team.team_id] = team;
      return teams;
    }, {});
  }

  /**
   * migrateMacGapCookiesToSession moves cookies from the MacGap cookie files
   * (i.e. either the sandboxed or non-sandboxed location) to our local
   * session. Similar to {findTokenFiles}, it attempts to be very liberal in
   * its search and use whatever it finds.
   *
   * @param  {Array<String>} tokenFiles   An array of paths returned from
   *                                      {findTokenFiles}. We'll find the
   *                                      cookie files relative to these paths,
   *                                      in order.
   *
   * @return {Promise}                    Completion.
   */
  async migrateMacGapCookiesToSession(tokenFiles) {
    let cookiesToMigrate = [];
    for (let x of tokenFiles) {
      let filePath = p`${path.dirname(x)}/../../Cookies/com.tinyspeck.slackmacgap.binarycookies`;
      let fileExists = fs.existsSync(filePath);
      logger.info(`Checking for non-sandboxed cookie at ${filePath}: ${fileExists}`);

      if (!fileExists) {
        filePath = p`${path.dirname(x)}/../../Cookies/Cookies.binarycookies`;
        fileExists = fs.existsSync(filePath);

        logger.info(`Checking for sandboxed cookie at ${filePath}: ${fileExists}`);
        if (!fileExists) continue;
      }

      cookiesToMigrate.push(filePath);
    }

    let cookiesSeen = {};
    for (let file of cookiesToMigrate) {
      logger.info(`Attempting to migrate cookie: ${file}`);
      await this.migrateCookieFile(file, cookiesSeen);
    }
  }

  /**
   * Migrate a single Cookies.binarycookies file into our session.
   *
   * @param  {String} file        The path to the Cookie file.
   * @param  {Object} cookiesSeen An Object used by migrateCookieFile that
   *                              keeps track of already-inserted cookies
   *                              across multiple invocations.
   *
   * @return {Promise}            Completion.
   */
  async migrateCookieFile(file, cookiesSeen) {
    const cookieParser = new CookieParser();
    let cookies = null;

    try {
      cookies = await new Promise((res,rej) => {
        cookieParser.parse(file, (err, val) => {
          if (err) { rej(err); } else { res(val); }
        });
      });
    } catch (e) {
      logger.error(`Couldn't open cookie file ${file}: ${e.message}`);
      return;
    }

    for (let cookie of cookies) {
      let key = `${cookie.url}:${cookie.name}`;
      if (cookiesSeen[key]) continue;

      try {
        await new Promise((res,rej) => {
          logger.info(`Setting ${key}`);

          let chromiumCookie = {
            url: `https://${cookie.url}`,
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            secure: true,
            session: false,
            expirationDate: cookie.expiration.getTime() / 1000,
          };

          logger.debug(JSON.stringify(chromiumCookie));

          session.defaultSession.cookies.set(chromiumCookie, (e) => {
            if (e) { logger.info(e); rej(e); } else { res(true); }
          });
        });

        cookiesSeen[key] = true;
      } catch (e) {
        logger.error(`Failed to set cookie for ${cookie.url}: ${e.message}`);
      }
    }
  }

  /**
   * Returns if the current app is Sandboxed
   *
   * @return {Boolean}    True if the app is sandboxed.
   */
  areWeSandboxed() {
    return process.execPath.match(/\/Containers\/Data\//);
  }

  /**
   * Attempts to find current MacGap settings directories in common
   * locations and returns the paths to their obfuscated information
   * files. This method will return its results sorted by file time,
   * so the first file is the most likely candidate to represent the
   * user's logged-in teams.
   *
   * @param  {Array<string>} extraPaths  An array of extra paths to check,
   *                                     for debugging purposes.
   *
   * @return {Array<string>}             A list of paths, in preference
   *                                     order (i.e. returnVal[0] is the
   *                                     most likely candidate)
   */
  findTokenFiles(extraPaths = []) {
    // This token filename is an md5 hash of /Applications/Slack.app, aka the most common
    // install directory for the Slack app. We should sort this to the top.
    const THE_ONE_TOKEN_FILE_TO_RULE_THEM_ALL = '5dd0c31de1e37442b5a4e61e8c608a0e.dat';

    let placesToLook = [
      p`${'home'}/Library/Containers/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack`
    ];

    if (!this.areWeSandboxed()) {
      placesToLook.push(p`${'home'}/Library/Application Support/Slack`);
    }

    if (extraPaths && extraPaths.length > 0) {
      placesToLook = extraPaths;
    }

    // We're going to attempt to find the token file that
    // has been written to last and use that
    logger.info(`Looking in ${JSON.stringify(placesToLook)}`);
    let tokens = [];
    for (let dir of placesToLook) {
      if (!fs.existsSync(dir)) continue;

      let entries = null;
      try {
        entries = fs.readdirSync(dir).filter((x) => x.match(/\.dat$/));
      } catch (e) {
        logger.error(`Failed to read ${dir}: ${e.message}`);
        continue;
      }

      for (let entry of entries) {
        tokens.push(p`${dir}/${entry}`);
      }
    }

    if (tokens.length < 1) {
      return null;
    }

    // Return the token file that was written to last or the token associated with
    // /Applications/Slack.app if found
    tokens.sort((a, b) => {
      let statA = fs.statSync(a);
      let statB = fs.statSync(b);

      if (a === THE_ONE_TOKEN_FILE_TO_RULE_THEM_ALL || statA.mtime > statB.mtime) {
        return -1;
      } else if (b === THE_ONE_TOKEN_FILE_TO_RULE_THEM_ALL || statA.mtime < statB.mtime) {
        return 1;
      }
      return 0;
    });

    return tokens;
  }
}

export default new MigrationManager();
