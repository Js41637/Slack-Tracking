import * as semver from 'semver';

export type FetchMethod = (url: string) => Promise<string>;

const PACKAGE_VERSION_REGEX = /^slack-(.*)-full\.nupkg$/i;

/**
 * Checks a given remote URL for the latest available release.
 * This method is Windows only; it parses a Squirrel.Windows RELEASES file.
 *
 * @export
 * @param {string}      url         The URL to check
 * @param {FetchMethod} fetchMethod The fetch method to use
 * @returns {Promise<string>}       The latest version
 */
export async function getLatestReleaseVersion(url: string, fetchMethod?: FetchMethod): Promise<string> {
  if (process.platform !== 'win32') throw new Error('Only valid on Windows');

  const fetchURL: FetchMethod = fetchMethod || require('./browser/fetch-url').fetchURL;
  const body = await fetchURL(url);

  // A single line from the body looks like:
  // 81D4BED4FD0FC59C3995D0CC8D8B35301D38851D slack-1.8.1-full.nupkg 60556480
  const versions = body.split('\n').map((line: string) => {
    const packageName = line.split(/\s+/)[1];
    if (!packageName) return null;

    const matches = packageName.match(PACKAGE_VERSION_REGEX);
    return matches && matches.length === 2 ? matches[1] : null;
  });

  return versions.reduce((acc: string, x: string) => {
    if (!semver.valid(x)) return acc;
    return semver.gt(acc, x) ? acc : x;
  }, '0.0.0')!;
}
