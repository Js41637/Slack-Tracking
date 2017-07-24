import { TeamBase } from '../actions/team-actions';
/**
 * @module Browser
 */ /** for typedoc */

import { session } from 'electron';
import * as fs from 'graceful-fs';
import { pick, transform } from 'lodash';
import * as path from 'path';

import { p } from '../get-path';
import { logger } from '../logger';
import { getInitialsOfName } from '../reducers/teams-reducer';
import * as CookieParser from './safari-cookies';

/**
 * This class provides ways to parse data from pre-2.0 versions of the Electron
 * client or from the MacGap client, during a one-time migration.
 */
export class MigrationManager {
  /**
   * The first time the app is run on Mac, we'll use a native node module to
   * retrieve the team list and auth tokens as a JSON blob.
   *
   * @param  {Boolean}  isDevMode  True if running in devMode, false if production
   * @return {Array}               An array of team objects
   */
  public async getMacGapData(isDevMode: boolean) {
    if (process.platform !== 'darwin') {
      logger.error('Should only be used on Mac');
      return null;
    }

    const extraLocations = [];
    if (isDevMode) {
      logger.info('Adding debug MacGap location');
      extraLocations.push(p`${'home'}/Desktop/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack`);
    }

    logger.info('Starting MacGap migration!');
    try {
      const macGapPrefReader = require('@slack/macgap-pref-reader');
      const tokenFiles = this.findTokenFiles(extraLocations);

      if (!tokenFiles) {
        logger.info("Couldn't find token file, assuming there are no MacGap settings to migrate");
        return null;
      }

      // Run through the list of token files and their associated team data.
      // The tokenFiles array is sorted in preference order (i.e. 'most likely
      // to be correct' file is first), so if we grab something valid out of it
      // we want to stick with it.
      logger.info(`Files to try: ${JSON.stringify(tokenFiles)}`);
      const teamList = tokenFiles.reduce((acc, x) => {
        if (acc) return acc;

        // NB: I hate this so bad. Tokens are stored in the Preference file, but
        // NSUserDefaults has no way to read any pref file other than its own.
        // So, we need to pass in their pref file and basically import it into
        // our own
        const theirPrefFile = p`${path.dirname(x)}/../../Preferences/com.tinyspeck.slackmacgap.plist`;
        if (!fs.existsSync(theirPrefFile)) return acc;

        logger.info(`Trying token file ${x}`);
        const macGapJson = macGapPrefReader.returnPrefInformation(
          path.dirname(x),
          path.basename(x),
          theirPrefFile);

        const list = JSON.parse(macGapJson);
        logger.info(`MacGap JSON: ${macGapJson}`);
        if (!list || list.length < 1) return null;

        return list;
      }, null);

      await this.migrateMacGapCookiesToSession(tokenFiles);

      if (!teamList) {
        logger.error('Found MacGap files, but none were parsable');
        return null;
      }

      const teams = this.parseTeamList(teamList);
      const teamsArray = Object.keys(teams).map((teamId) => teams[teamId]);

      logger.info(`Teams from MacGap: ${JSON.stringify(teamsArray)}`);
      return teamsArray;
    } catch (e) {
      logger.error(`MacGap teams migration failed: ${e.stack}`);
      return null;
    }
  }

  private parseTeamList(teamList: Array<any>) {
    return transform<Array<TeamBase>, any>(teamList, (teams: Array<any>, teamEntry: any) => {
      const team = pick<any, any>(teamEntry, 'name', 'id', 'team_id', 'team_name', 'team_url', 'theme', 'icons');
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
  private async migrateMacGapCookiesToSession(tokenFiles: Array<string>) {
    const cookiesToMigrate = [];
    for (const x of tokenFiles) {
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

    const cookiesSeen = {};
    for (const file of cookiesToMigrate) {
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
  private async migrateCookieFile(file: string, cookiesSeen: any) {
    const cookieParser = (CookieParser as any)();
    let cookies: {
      [Symbol.iterator](): any
    } | null = null;

    try {
      cookies = await new Promise<{
        [Symbol.iterator](): any
      }>((resolve, reject) => {
        cookieParser.parse(file, (err: Error, val: any) => {
          if (err) { reject(err); } else { resolve(val); }
        });
      });
    } catch (e) {
      logger.error(`Couldn't open cookie file ${file}: ${e.message}`);
      return;
    }

    for (const cookie of cookies) {
      const key = `${cookie.url}:${cookie.name}`;
      if (cookiesSeen[key]) continue;

      try {
        await new Promise((resolve, reject) => {
          logger.info(`Setting ${key}`);

          const chromiumCookie = {
            url: `https://${cookie.url}`,
            name: cookie.name,
            value: cookie.value,
            path: cookie.path,
            secure: true,
            session: false,
            expirationDate: cookie.expiration.getTime() / 1000,
          };

          logger.debug(JSON.stringify(chromiumCookie));

          session.defaultSession!.cookies.set(chromiumCookie, (e) => {
            if (e) { logger.info(e as any); reject(e); } else { resolve(true); }
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
  private get areWeSandboxed(): boolean {
    return !!process.execPath.match(/\/Containers\/Data\//);
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
  private findTokenFiles(extraPaths: Array<string> = []): Array<string> | null {
    // This token filename is an md5 hash of /Applications/Slack.app, aka the most common
    // install directory for the Slack app. We should sort this to the top.
    const THE_ONE_TOKEN_FILE_TO_RULE_THEM_ALL = '5dd0c31de1e37442b5a4e61e8c608a0e.dat';

    let placesToLook = [
      p`${'home'}/Library/Containers/com.tinyspeck.slackmacgap/Data/Library/Application Support/Slack`
    ];

    if (!this.areWeSandboxed) {
      placesToLook.push(p`${'home'}/Library/Application Support/Slack`);
    }

    if (extraPaths && extraPaths.length > 0) {
      placesToLook = extraPaths;
    }

    // We're going to attempt to find the token file that
    // has been written to last and use that
    logger.info(`Looking in ${JSON.stringify(placesToLook)}`);
    const tokens = [];
    for (const dir of placesToLook) {
      if (!fs.existsSync(dir)) continue;

      let entries = null;
      try {
        entries = fs.readdirSync(dir).filter((x) => x.match(/\.dat$/));
      } catch (e) {
        logger.error(`Failed to read ${dir}: ${e.message}`);
        continue;
      }

      for (const entry of entries) {
        tokens.push(p`${dir}/${entry}`);
      }
    }

    if (tokens.length < 1) {
      return null;
    }

    // Return the token file that was written to last or the token associated with
    // /Applications/Slack.app if found
    tokens.sort((a, b) => {
      const statA = fs.statSync(a);
      const statB = fs.statSync(b);

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

const migrationManager = new MigrationManager();
export {
  migrationManager
};
