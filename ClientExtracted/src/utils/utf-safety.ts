/**
 * Tests a string for invalid UTF characters,
 * resulting in a � when parsed.
 *
 * @export
 * @param {string} [input=''] Input string
 * @returns {(RegExpExecArray | null)}
 */
export function getContainsInvalid(input: string = ''): RegExpExecArray | null {
  return /\uFFFD/.exec(input);
}
