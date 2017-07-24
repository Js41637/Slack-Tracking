/**
 * @module IPC
 */ /** for typedoc */

import { assignIn } from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

//lock down type to IpcMain, as module is actually determined runtime can't have corresponding types for ipcRenderer
const electronIpc = require('electron')[process.type === 'renderer' ?
  'ipcRenderer' : 'ipcMain'] as (Electron.IpcMain | Electron.IpcRenderer);

const ipc = assignIn({}, electronIpc, {
  listen: (channel: string) => {
    return Observable.create((subj: Subject<any>) => {

      const listener = (process.type === 'browser' ?
        (_event: Electron.Event, args: any) => subj.next(args) :
        (...args: Array<any>) => subj.next(args));

      electronIpc.on(channel, listener);

      return new Subscription(() =>
        electronIpc.removeListener(channel, listener));
    });
  }
});

export {
  ipc
};
