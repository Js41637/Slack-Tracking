/**
 * Truncates a string to a max length of 25. Will split on a word boundary and
 * add an ellipsis.
 *
 * @param  {String} string The string to truncate
 * @return {String}        The truncated string
 */
export function truncateString(s: string) {
  const match = s.match(/^.{0,25}[\S]*/) || [''];
  const length = match[0].length;
  let result = match[0].replace(/\s$/, '');

  if (length < s.length) result += '…';
  return result;
}
