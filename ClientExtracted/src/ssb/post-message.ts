/**
 * @module SSBIntegration
 */ /** for typedoc */

export function getPostMessageTemplate(data: string | Object, origin: string, browserWindowId: number): string {
  const stringData = (typeof data === 'string') ? `'${data}'` : JSON.stringify(data);

  const code =
    `(function () {` +
    `let evt = new Event('message');` +
    `evt.data = ${stringData};` +
    `evt.origin = '${origin}';` +
    `evt.source = {};` +
    `evt.source.postMessage = function (message) {` +
    `  if (!desktop || !desktop.window || !desktop.window.postMessage) throw 'desktop not ready';` +
    `  return desktop.window.postMessage(message, ${browserWindowId});` +
    `};` +
    `window.dispatchEvent(evt);` +
    `})();`;

  return code;
}
