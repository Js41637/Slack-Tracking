/**
 * @module SSBIntegration
 */ /** for typedoc */

import { getContextMenuBuilder } from '../context-menu';
import { ContextMenuListener, SpellCheckHandler, setGlobalLogger } from 'electron-spellchecker';
import { ipc } from '../ipc-rx';
import { logger } from '../logger';

setGlobalLogger(logger.info.bind(logger));

export class SpellCheckingHelper {
  public readonly spellCheckHandler = new SpellCheckHandler();
  private contextMenuListener: any;

  constructor() {
    if (!global.loadSettings.devMode) {
      this.spellCheckHandler.autoUnloadDictionariesOnBlur();
    }
  }

  public setupInputEventListener(): void {
    this.spellCheckHandler.attachToInput();
    const contextMenuIpc = ipc.listen('context-menu-ipc').map((x: Array<any>) => x[1]);

    if (process.guestInstanceId) {
      this.contextMenuListener = new ContextMenuListener((info: any) => {
        ipc.sendToHost('context-menu-show', info);
      }, null, contextMenuIpc);
    } else {
      const contextMenuBuilder = getContextMenuBuilder(this.spellCheckHandler);

      this.contextMenuListener = new ContextMenuListener(async (info: any) => {
        await contextMenuBuilder.showPopupMenu(info);
      }, null, contextMenuIpc);
    }
  }
}
