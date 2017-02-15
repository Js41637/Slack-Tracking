import * as assignIn from 'lodash.assignin';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

//lock down type to IpcMain, as module is actually determined runtime can't have corresponding types for ipcRenderer
const electronIpc = require('electron')[process.type === 'renderer' ?
  'ipcRenderer' : 'ipcMain'] as Electron.IpcMain;

const ipc = assignIn({}, electronIpc, {
  listen: (channel: string) => {
    return Observable.create((subj: Subject<any>) => {

      const listener = (process.type === 'browser' ?
        (_event: Electron.IpcMainEvent, args: any) => subj.next(args) :
        (...args: Array<any>) => subj.next(args)) as Electron.IpcMainEventListener;

      electronIpc.on(channel, listener);

      return new Subscription(() =>
        electronIpc.removeListener(channel, listener));
    });
  }
});

export {
  ipc
};
