import {ContextMenuBuilder, ContextMenuListener, SpellCheckHandler, setGlobalLogger} from 'electron-spellchecker';
import ipcRenderer from '../ipc-rx';
import {logger} from '../logger';

setGlobalLogger(logger.info.bind(logger));

export default class SpellCheckingHelper {
  constructor() {
    this.spellCheckHandler = new SpellCheckHandler();

    if (!global.loadSettings.devMode) {
      this.spellCheckHandler.autoUnloadDictionariesOnBlur();
    }
  }

  setupInputEventListener() {
    this.spellCheckHandler.attachToInput();
    let contextMenuIpc = ipcRenderer.listen('context-menu-ipc').map((x) => x[1]);

    if (process.guestInstanceId) {
      this.contextMenuListener = new ContextMenuListener((info) => {
        ipcRenderer.sendToHost('context-menu-show', info);
      }, null, contextMenuIpc);
    } else {
      let contextMenuBuilder = new ContextMenuBuilder(this.spellCheckHandler);

      this.contextMenuListener = new ContextMenuListener(async function(info) {
        await contextMenuBuilder.showPopupMenu(info);
      }, null, contextMenuIpc);
    }
  }
}
