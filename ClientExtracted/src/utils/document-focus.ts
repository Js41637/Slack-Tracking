/**
 * Document focus (aka selection ranges) in the main renderer overrides the
 * focused element in child webview tags, when it comes time for Chromium to
 * decide where to position popups like the text palette. To workaround this,
 * we can remove all selection ranges from the main renderer.
 */
export function releaseDocumentFocus(): void {
  const element = document.createElement('span');
  document.body.appendChild(element);

  const range = document.createRange();
  range.setStart(element, 0);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  selection.removeAllRanges();

  document.body.removeChild(element);
}
