/**
 * Filter method to remove xoxs tokens from all messages.
 *
 * @param {String} message  The original message
 * @returns {String}        The redacted message
 */
export function redactApiTokens(message: string): string {
  return message.replace(/(xoxs-)[\w-]*/g, '$1⋯');
}