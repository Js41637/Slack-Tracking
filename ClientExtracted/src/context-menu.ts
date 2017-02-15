import {intl as $intl, LOCALE_NAMESPACE} from './i18n/intl';
import {ContextMenuBuilder} from 'electron-spellchecker';

const contextMenuStringTable = {
  copyMail: $intl.t(`Copy Email Address`, LOCALE_NAMESPACE.MENU),
  copyLinkUrl: $intl.t(`Copy Link`, LOCALE_NAMESPACE.MENU),
  openLinkUrl: $intl.t(`Open Link`, LOCALE_NAMESPACE.MENU),
  copyImageUrl: $intl.t(`Copy Image URL`, LOCALE_NAMESPACE.MENU),
  copyImage: $intl.t(`Copy Image`, LOCALE_NAMESPACE.MENU),
  addToDictionary: $intl.t(`Add to Dictionary`, LOCALE_NAMESPACE.MENU),
  lookUpDefinition: $intl.t(`Look Up "{word}"`, LOCALE_NAMESPACE.MENU),
  searchGoogle: $intl.t(`Search with Google`, LOCALE_NAMESPACE.MENU),
  cut: $intl.t(`Cut`, LOCALE_NAMESPACE.MENU),
  copy: $intl.t(`Copy`, LOCALE_NAMESPACE.MENU),
  paste: $intl.t(`Paste`, LOCALE_NAMESPACE.MENU),
  inspectElement: $intl.t(`Inspect Element`, LOCALE_NAMESPACE.MENU),
};

export function getContextMenuBuilder(...args: Array<any>) {
  const menu = new ContextMenuBuilder(...args);
  menu.setAlternateStringFormatter(contextMenuStringTable);
  return menu;
}
