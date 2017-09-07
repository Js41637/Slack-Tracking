/**
 * @module SSBIntegration
 */ /** for typedoc */

import { ContextMenuBuilder } from '../context-menu';
import { ContextMenuListener } from '../context-menu-listener';
import { ipc } from '../ipc-rx';
import { logger } from '../logger';
import { settingStore } from '../stores/setting-store';
import { CHROME_BDICTS } from '../utils/chrome-bdicts';
import { Language, getLanguageNames, removeUnneccessaryRegions } from '../utils/iso639';

export class SpellCheckingHelper {
  /**
   * Returns the available dictionaries on this device.
   *
   * @static
   * @returns {Array<Language>}
   */
  public static getDictionaries(): Array<Language> {
    try {
      // This is a direct way to @paulcbetts/node-spellchecker with the
      // configuration passed in by electron-spellchecker. It's also
      // our way to find which dictionaries it has available.
      const spellchecker = require('electron-spellchecker').SpellChecker;
      const dictionaries: Array<string> = spellchecker.getAvailableDictionaries();
      const selectedLanguage = settingStore.getSetting('spellcheckerLanguage');

      // On Windows and Linux, we use Hunspell. It always returns []
      if (process.platform !== 'darwin') {
        dictionaries.push(...CHROME_BDICTS);
      }

      const namedLanguages = dictionaries.map((language) => {
        const namedLanguage = getLanguageNames(language, {
          includeEnglishNames: false
        });

        if (selectedLanguage && namedLanguage.key === selectedLanguage) {
          namedLanguage.selected = true;
        }

        return namedLanguage;
      });

      return removeUnneccessaryRegions(namedLanguages);
    } catch (error) {
      logger.error('SpellChecker: Tried to fetch available dictionaries, but failed', error);

      return [];
    }
  }


  public spellCheckHandler: any;
  public getDictionaries = SpellCheckingHelper.getDictionaries;
  private contextMenuListener: any;

  constructor() {
    this.setupSpellChecker();
    this.setupInputEventListener();
  }

  /**
   * Configures the spellchecker to only check in the given language. On macOS, it'll
   * accept all dictionary identifiers used by macOS ("de-DE", "german", "de"), while
   * it'll attempt to find a fitting dictionary on Windows and Linux, where hunspell
   * needs a precise dictionary identifier.
   *
   * If the method is called without parameters (or a falsey one), it'll configure the
   * spellchecker to continuously attempt auto-detection of the typed language.
   *
   * @param {string} [language]
   */
  public updateLanguage(language?: string) {
    try {
      if (language) {
        this.spellCheckHandler.switchLanguage(language);
      }

      this.spellCheckHandler.automaticallyIdentifyLanguages = !!language;
    } catch (error) {
      logger.warn(`Spellchecker: Tried to update spellchecker language, but failed`, { error });
    }
  }

  private setupSpellChecker() {
    try {
      const { SpellCheckHandler, setGlobalLogger } = require('electron-spellchecker');
      const language = settingStore.getSetting('spellcheckerLanguage');

      setGlobalLogger(logger.info.bind(logger));

      this.spellCheckHandler = new SpellCheckHandler();
      this.spellCheckHandler.autoUnloadDictionariesOnBlur();

      // We can optionally force a language. This is useful for customers who
      // use a mix of languages that computers get confused by.
      if (language) {
        this.spellCheckHandler.automaticallyIdentifyLanguages = false;
        this.spellCheckHandler.switchLanguage(language);
      }
    } catch (error) {
      logger.warn(`Spellchecker: We tried to setup the spellchecker, but failed`, { error });
    }
  }

  private setupInputEventListener(): void {
    if (this.spellCheckHandler) this.spellCheckHandler.attachToInput();

    const contextMenuIpc = ipc.listen('context-menu-ipc').map((x: Array<any>) => x[1]);

    if (process.guestInstanceId) {
      this.contextMenuListener = new ContextMenuListener((info: any) => {
        (ipc as Electron.IpcRenderer).sendToHost('context-menu-show', info);
      }, null, contextMenuIpc);
    } else {
      const contextMenuBuilder = new ContextMenuBuilder(this.spellCheckHandler);

      this.contextMenuListener = new ContextMenuListener(async (info: any) => {
        await contextMenuBuilder.showPopupMenu(info);
      }, null, contextMenuIpc);
    }
  }
}
