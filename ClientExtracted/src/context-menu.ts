/**
 * @module ContextMenu
 */ /** for typedoc */

import { clipboard, nativeImage, screen, shell } from 'electron';

import { LOCALE_NAMESPACE, intl as $intl } from './i18n/intl';
import { logger } from './logger';
import { matchesWord } from './utils/matches-word';
import { truncateString } from './utils/truncate-string';

let Menu: typeof Electron.Menu,
    MenuItem: typeof Electron.MenuItem,
    BrowserWindow: typeof Electron.BrowserWindow,
    remote: Electron.Remote;

if (process.type === 'renderer') {
  remote = require('electron').remote;
  Menu = remote.Menu;
  MenuItem = remote.MenuItem;
  BrowserWindow = remote.BrowserWindow;
} else {
  Menu = require('electron').Menu;
  MenuItem = require('electron').MenuItem;
  BrowserWindow = require('electron').BrowserWindow;
}

export interface ContextMenuStringTable {
  copyMail: () => string;
  copyLinkUrl: () => string;
  openLinkUrl: () => string;
  copyImageUrl: () => string;
  copyImage: () => string;
  addToDictionary: () => string;
  lookUpDefinition: (...args: Array<any>) => string;
  searchGoogle: () => string;
  cut: () => string;
  copy: () => string;
  paste: () => string;
  inspectElement: () => string;
}

export const contextMenuStringTable = {
  copyMail: () => $intl.t('Copy Email Address', LOCALE_NAMESPACE.MENU)(),
  copyLinkUrl: () => $intl.t('Copy Link', LOCALE_NAMESPACE.MENU)(),
  openLinkUrl: () => $intl.t('Open Link', LOCALE_NAMESPACE.MENU)(),
  copyImageUrl: () => $intl.t('Copy Image URL', LOCALE_NAMESPACE.MENU)(),
  copyImage: () => $intl.t('Copy Image', LOCALE_NAMESPACE.MENU)(),
  addToDictionary: () => $intl.t('Add to Dictionary', LOCALE_NAMESPACE.MENU)(),
  // @i18n Do not translate between {}
  lookUpDefinition: (...args: Array<any>) => $intl.t('Look Up "{word}"', LOCALE_NAMESPACE.MENU)(...args),
  searchGoogle: () => $intl.t('Search with Google', LOCALE_NAMESPACE.MENU)(),
  cut: () => $intl.t('Cut', LOCALE_NAMESPACE.MENU)(),
  copy: () => $intl.t('Copy', LOCALE_NAMESPACE.MENU)(),
  paste: () => $intl.t('Paste', LOCALE_NAMESPACE.MENU)(),
  inspectElement: () => $intl.t('Inspect Element', LOCALE_NAMESPACE.MENU)(),
};

export type WindowOrWebContents = Electron.BrowserWindow | Electron.WebContents | Electron.WebviewTag | null;

export const getCurrentWindow = () => {
  return process.type === 'renderer'
          ? remote.getCurrentWindow()
          : BrowserWindow.getFocusedWindow();
};
export class ContextMenuBuilder {
  public menu: Electron.Menu | null = null;
  public readonly webContents: Electron.WebContents;
  public stringTable: ContextMenuStringTable;
  public getWebContents: () => Electron.WebContents;

  /**
   * Creates an instance of ContextMenuBuilder
   *
   * @param  {SpellCheckHandler} spellCheckHandler  The spell checker to generate
   *                                                recommendations for.
   * @param  {BrowserWindow|WebView} windowOrWebView  The hosting window/WebView
   * @param  {Boolean} debugMode    If true, display the "Inspect Element" menu item.
   * @param  {function} processMenu If passed, this method will be passed the menu to change
   *                                it prior to display. Signature: (menu, info) => menu
   */
  constructor(readonly spellCheckHandler?: any,
              windowOrWebView: WindowOrWebContents = getCurrentWindow(),
              readonly debugMode: boolean = false,
              readonly processMenu: ((m: Electron.Menu, mi: Electron.ContextMenuParams) => Electron.Menu) = (m) => m) {
    this.stringTable = contextMenuStringTable;

    const ctorName = Object.getPrototypeOf(windowOrWebView).constructor.name;
    if (ctorName === 'WebContents') {
      this.getWebContents = () => windowOrWebView as Electron.WebContents;
    } else {
      // NB: We do this because at the time a WebView is created, it doesn't
      // have a WebContents, we need to defer the call to getWebContents
      this.getWebContents = 'webContents' in windowOrWebView! ?
        () => (windowOrWebView! as Electron.BrowserWindow).webContents :
        () => (windowOrWebView! as Electron.WebviewTag).getWebContents();
    }
  }

   /**
    * Specify alternate string formatter for each context menu.
    * String table consist of string formatter as function instead per each context menu item,
    * allows to change string in runtime. All formatters are simply typeof () => string, except
    * lookUpDefinition provides word, ({word}) => string.
    *
    * @param {Object} stringTable The object contains string formatter function for context menu.
    * It is allowed to specify only certain menu string as necessary, which will makes other string
    * fall backs to default.
    *
    */
  public setAlternateStringFormatter(stringTable: ContextMenuStringTable) {
    this.stringTable = { ...stringTable };
  }

  /**
   * Shows a popup menu given the information returned from the context-menu
   * event. This is probably the only method you need to call in this class.
   *
   * @param  {Object} contextInfo   The object returned from the 'context-menu'
   *                                Electron event.
   *
   * @return {Promise}              Completion
   */
  public async showPopupMenu(contextInfo: Electron.ContextMenuParams): Promise<void> {
    const menu = await this.buildMenuForElement(contextInfo);

    if (!menu) return;

    const currentWindow: Electron.BrowserWindow = getCurrentWindow();

    (menu).popup(currentWindow, { y: screen.getCursorScreenPoint().y, async: true });
  }

  /**
   * Builds a context menu specific to the given info that _would_ be shown
   * immediately by {{showPopupMenu}}. Use this to add your own menu items to
   * the list but use most of the default behavior.
   *
   * @return {Promise<Menu>}      The newly created `Menu`
   */
  public async buildMenuForElement(info: Electron.ContextMenuParams): Promise<Electron.Menu> {
    if (info.linkURL && info.linkURL.length > 0) {
      return this.buildMenuForLink(info);
    }

    if (info.hasImageContents && info.srcURL && info.srcURL.length > 1) {
      return this.buildMenuForImage(info);
    }

    if (info.isEditable || (info.inputFieldType && info.inputFieldType !== 'none')) {
      return await this.buildMenuForTextInput(info);
    }

    return this.buildMenuForText(info);
  }

  /**
   * Builds a menu applicable to a text input field.
   *
   * @return {Electron.Menu}  The `Menu`
   */
  public async buildMenuForTextInput(menuInfo: Electron.ContextMenuParams) {
    const menu = new Menu();

    if (this.spellCheckHandler) {
      await this.addSpellingItems(menu, menuInfo);
    }

    this.addSearchItems(menu, menuInfo);
    this.addCut(menu, menuInfo);
    this.addCopy(menu, menuInfo);
    this.addPaste(menu, menuInfo);
    this.addInspectElement(menu, menuInfo);
    this.processMenu(menu, menuInfo);

    return menu;
  }

  /**
   * Builds a menu applicable to a link element.
   *
   * @return {Electron.Menu}  The `Menu`
   */
  public buildMenuForLink(menuInfo: Electron.ContextMenuParams): Electron.Menu {
    const menu = new Menu();
    const isEmailAddress = menuInfo.linkURL.startsWith('mailto:');

    const copyLink = new MenuItem({
      label: isEmailAddress ? this.stringTable.copyMail() : this.stringTable.copyLinkUrl(),
      click: () => {
        // Omit the mailto: portion of the link; we just want the address
        clipboard.writeText(isEmailAddress ? menuInfo.linkText : menuInfo.linkURL);
      }
    });

    const openLink = new MenuItem({
      label: this.stringTable.openLinkUrl(),
      click: () => shell.openExternal(menuInfo.linkURL)
    });

    menu.append(copyLink);
    menu.append(openLink);

    if (this.isSrcUrlValid(menuInfo)) {
      this.addSeparator(menu);
      this.addImageItems(menu, menuInfo);
    }

    this.addInspectElement(menu, menuInfo);
    this.processMenu(menu, menuInfo);

    return menu;
  }

  /**
   * Builds a menu applicable to a text field.
   *
   * @return {Electron.Menu}  The `Menu`
   */
  public buildMenuForText(menuInfo: Electron.ContextMenuParams): Electron.Menu {
    const menu = new Menu();

    this.addSearchItems(menu, menuInfo);
    this.addCopy(menu, menuInfo);
    this.addInspectElement(menu, menuInfo);
    this.processMenu(menu, menuInfo);

    return menu;
  }

  /**
   * Builds a menu applicable to an image.
   *
   * @return {Electron.Menu}  The `Menu`
   */
  public buildMenuForImage(menuInfo: Electron.ContextMenuParams): Electron.Menu {
    const menu = new Menu();

    if (this.isSrcUrlValid(menuInfo)) {
      this.addImageItems(menu, menuInfo);
    }
    this.addInspectElement(menu, menuInfo);
    this.processMenu(menu, menuInfo);
    return menu;
  }

  /**
   * Checks if the current text selection contains a single misspelled word and
   * if so, adds suggested spellings as individual menu items.
   */
  public async addSpellingItems(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    const target = this.getWebContents();

    if ((!menuInfo.misspelledWord || menuInfo.misspelledWord.length < 1)
      || !this.spellCheckHandler.currentSpellchecker) {
      return menu;
    }

    // Ensure that we have valid corrections for that word
    const corrections = await this.spellCheckHandler.getCorrectionsForMisspelling(menuInfo.misspelledWord);
    if (!corrections || !corrections.length) {
      return menu;
    }

    corrections.forEach((correction: string) => {
      const item = new MenuItem({
        label: correction,
        click: () => target.replaceMisspelling(correction)
      });

      menu.append(item);
    });

    this.addSeparator(menu);

    // Gate learning words based on OS support. At some point we can manage a
    // custom dictionary for Hunspell, but today is not that day
    if (process.platform === 'darwin') {
      const learnWord = new MenuItem({
        label: this.stringTable.addToDictionary(),
        click: async () => {
          // NB: This is a gross fix to invalidate the spelling underline,
          // refer to https://github.com/tinyspeck/slack-winssb/issues/354
          this.webContents.replaceMisspelling(menuInfo.selectionText);

          try {
            await this.spellCheckHandler.add(menuInfo.misspelledWord);
          } catch (e) {
            logger.warn(`Failed to add entry to dictionary: ${e.message}`);
          }
        }
      });

      menu.append(learnWord);
    }

    return menu;
  }

  /**
   * Adds search-related menu items.
   */
  public addSearchItems(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    if (!menuInfo.selectionText || menuInfo.selectionText.length < 1) {
      return menu;
    }

    const match = matchesWord(menuInfo.selectionText);
    if (!match || match.length === 0) {
      return menu;
    }

    if (process.platform === 'darwin') {
      const lookUpDefinition = new MenuItem({
        label: this.stringTable.lookUpDefinition({ word: truncateString(menuInfo.selectionText) }),
        click: () => this.getWebContents().showDefinitionForSelection()
      });

      menu.append(lookUpDefinition);
    }

    const search = new MenuItem({
      label: this.stringTable.searchGoogle(),
      click: () => shell.openExternal(`https://www.google.com/#q=${encodeURIComponent(menuInfo.selectionText)}`)
    });

    menu.append(search);
    this.addSeparator(menu);

    return menu;
  }

  public isSrcUrlValid(menuInfo: Electron.ContextMenuParams) {
    return menuInfo.srcURL && menuInfo.srcURL.length > 0;
  }

  /**
   * Adds "Copy Image" and "Copy Image URL" items when `src` is valid.
   */
  public addImageItems(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    const copyImage = new MenuItem({
      label: this.stringTable.copyImage(),
      click: () => this.convertImageToBase64(menuInfo.srcURL,
        (dataURL: string) => clipboard.writeImage(nativeImage.createFromDataURL(dataURL)))
    });

    const copyImageUrl = new MenuItem({
      label: this.stringTable.copyImageUrl(),
      click: () => clipboard.writeText(menuInfo.srcURL)
    });

    menu.append(copyImage);
    menu.append(copyImageUrl);
    return menu;
  }

  /**
   * Adds the Cut menu item
   */
  public addCut(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    menu.append(new MenuItem({
      label: this.stringTable.cut(),
      accelerator: 'CommandOrControl+X',
      enabled: menuInfo.editFlags.canCut,
      click: () => this.getWebContents().cut()
    }));

    return menu;
  }

  /**
   * Adds the Copy menu item.
   */
  public addCopy(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    menu.append(new MenuItem({
      label: this.stringTable.copy(),
      accelerator: 'CommandOrControl+C',
      enabled: menuInfo.editFlags.canCopy,
      click: () => this.getWebContents().copy()
    }));

    return menu;
  }

  /**
   * Adds the Paste menu item.
   */
  public addPaste(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams) {
    menu.append(new MenuItem({
      label: this.stringTable.paste(),
      accelerator: 'CommandOrControl+V',
      enabled: menuInfo.editFlags.canPaste,
      click: () => this.getWebContents().paste()
    }));

    return menu;
  }

  /**
   * Adds a separator item.
   */
  public addSeparator(menu: Electron.Menu) {
    menu.append(new MenuItem({ type: 'separator' }));
    return menu;
  }

  /**
   * Adds the "Inspect Element" menu item.
   */
  public addInspectElement(menu: Electron.Menu, menuInfo: Electron.ContextMenuParams, needsSeparator: boolean = true) {
    if (!this.debugMode) return menu;
    if (needsSeparator) this.addSeparator(menu);

    const inspect = new MenuItem({
      label: this.stringTable.inspectElement(),
      click: () => this.getWebContents().inspectElement(menuInfo.x, menuInfo.y)
    });

    menu.append(inspect);
    return menu;
  }

  /**
   * Converts an image to a base-64 encoded string.
   *
   * @param  {String} url           The image URL
   * @param  {Function} callback    A callback that will be invoked with the result
   * @param  {String} outputFormat  The image format to use, defaults to 'image/png'
   */
  public convertImageToBase64(url: string, callback: (dataUrl: string) => void, outputFormat: string = 'image/png') {
    let canvas: HTMLCanvasElement | null = document.createElement('CANVAS') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      canvas!.height = img.height;
      canvas!.width = img.width;
      ctx!.drawImage(img, 0, 0);

      const dataURL = canvas!.toDataURL(outputFormat);
      canvas = null;
      callback(dataURL);
    };

    img.src = url;
  }
}
