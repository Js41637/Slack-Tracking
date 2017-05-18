/**
 * @module SSBIntegration
 */ /** for typedoc */

import { ContextMenuBuilder } from '../context-menu';
import { ContextMenuListener } from '../context-menu-listener';
import { ipc } from '../ipc-rx';
import { logger } from '../logger';


export class SpellCheckingHelper {
  public spellCheckHandler: any;
  private contextMenuListener: any;

  constructor() {
    this.setupSpellChecker();
    this.setupInputEventListener();
  }

  private setupSpellChecker() {
    try {
      const { SpellCheckHandler, setGlobalLogger } = require('electron-spellchecker');

      setGlobalLogger(logger.info.bind(logger));

      this.spellCheckHandler = new SpellCheckHandler();
      this.spellCheckHandler.autoUnloadDictionariesOnBlur();
    } catch (error) {
      logger.warn(`We tried to setup the spellchecker, but failed`, error);
    }
  }

  private setupInputEventListener(): void {
    if (this.spellCheckHandler) this.spellCheckHandler.attachToInput();

    const contextMenuIpc = ipc.listen('context-menu-ipc').map((x: Array<any>) => x[1]);

    if (process.guestInstanceId) {
      this.contextMenuListener = new ContextMenuListener((info: any) => {
        ipc.sendToHost('context-menu-show', info);
      }, null, contextMenuIpc);
    } else {
      const contextMenuBuilder = new ContextMenuBuilder(this.spellCheckHandler);

      this.contextMenuListener = new ContextMenuListener(async (info: any) => {
        await contextMenuBuilder.showPopupMenu(info);
      }, null, contextMenuIpc);
    }
  }
}
