import fs from 'fs';
import sortBy from 'lodash.sortby';

/**
 * Reads the licenses file created by `generateLicenseFile` and parses out the
 * individual dependencies.
 *
 * @param  {String} pathToLicenses  The absolute path to the generated LICENSES file
 * @return {Promise}                A Promise whose value is an array of dependencies
 *                                  extracted from the licenses file
 */
export function parseLicenses(pathToLicenses) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathToLicenses, 'utf8', (error, contents) => {
      if (error) {
        reject(error);
        return;
      }

      let separatorRegExp = new RegExp(
        /^------------------\r\n/,  // Line must start with this separator and end with a new-line
        'm'                         // Treat input as multi-line string
      );

      if (!contents) resolve([]);

      let separators = contents.split(separatorRegExp);
      let dependencies = [];

      for (let idx = 0; idx < separators.length - 1; idx++) {
        let lastLineIndex = indexOfLastLine(separators[idx]);
        let lastLine = separators[idx].slice(lastLineIndex);

        lastLineIndex = indexOfLastLine(separators[idx + 1]);
        let license = separators[idx + 1].slice(0, lastLineIndex);
        let firstLineIndex = license.indexOf('\r\n');

        dependencies.push({
          name: lastLine.trim(),
          licenseName: license.slice(0, firstLineIndex).trim(),
          licenseText: license.slice(firstLineIndex).trim()
        });
      }

      let sortedDependencies = sortBy(dependencies, (dep) => dep.name);
      resolve(sortedDependencies);
    });
  });
}

function indexOfLastLine(searchValue) {
  let lineBreak = '\r\n';
  let fromIndex = searchValue.length - lineBreak.length - 1;
  return searchValue.lastIndexOf(lineBreak, fromIndex);
}
