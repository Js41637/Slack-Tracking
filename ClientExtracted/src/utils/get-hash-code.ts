/**
 * Simple hash code generation compliant to Java's string.hashCode().
 *
 * @param {string} str String value to generate hash code.
 * @return {number} Generated hashcode, gauranteed to have positive integer.
 */
export function getHashCode(str: string): number {
  let hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return (hash + 2147483647) + 1;
}
