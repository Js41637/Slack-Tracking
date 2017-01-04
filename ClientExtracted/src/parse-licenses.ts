import * as fs from 'fs';
import * as sortBy from 'lodash.sortby';

const lineBreak = '\r\n';

export interface License {
  name: string;
  licenseName: string;
  licenseText: string;
}

/**
 * Reads the licenses file created by `generateLicenseFile` and parses out the
 * individual dependencies.
 *
 * @param  {String} pathToLicenses  The absolute path to the generated LICENSES file
 * @return {Promise}                A Promise whose value is an array of dependencies
 *                                  extracted from the licenses file
 */
export function parseLicenses(pathToLicenses: string): Promise<Array<License>> {
  return new Promise((resolve, reject) => {
    fs.readFile(pathToLicenses, 'utf8', (error, contents) => {
      if (error) {
        reject(error);
        return;
      }

      const separatorRegExp = new RegExp(
        /^------------------\r\n/,  // Line must start with this separator and end with a new-line
        'm'                         // Treat input as multi-line string
      );

      if (!contents) resolve([]);

      const separators = contents.split(separatorRegExp);
      const dependencies: Array<License> = [];

      for (let idx = 0; idx < separators.length - 1; idx++) {
        let lastLineIndex = indexOfLastLine(separators[idx]);
        const lastLine = separators[idx].slice(lastLineIndex);

        lastLineIndex = indexOfLastLine(separators[idx + 1]);
        const license = separators[idx + 1].slice(0, lastLineIndex);
        const firstLineIndex = license.indexOf('\r\n');

        dependencies.push({
          name: lastLine.trim(),
          licenseName: license.slice(0, firstLineIndex).trim(),
          licenseText: license.slice(firstLineIndex).trim()
        });
      }

      const sortedDependencies = sortBy(dependencies, (dep: License) => dep.name);
      resolve(sortedDependencies);
    });
  });
}

function indexOfLastLine(searchValue: string): number {
  const fromIndex = searchValue.length - lineBreak.length - 1;
  return searchValue.lastIndexOf(lineBreak, fromIndex);
}
