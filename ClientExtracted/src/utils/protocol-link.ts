export function isSettingsLink(url: string) {
  const rgx = /^slack:\/\/setting/i;
  return rgx.test(url);
}

export function isReplyLink(url: string) {
  const rgx = /^slack:\/\/reply/i;
  return rgx.test(url);
}

export function isSlackLink(url: string) {
  const rgx = /^slack:/i;
  return rgx.test(url);
}
