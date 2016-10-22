import _ from 'lodash';
import {Observable, Disposable} from 'rx';

const ipc = require('electron')[process.type === 'renderer' ?
  'ipcRenderer': 'ipcMain'];

export default _.extend({}, ipc, {
  listen: (channel) => {
    return Observable.create((subj) => {
      
      let listener = process.type === 'browser' ?
        (event, args) => subj.onNext(args) :
        (...args) => subj.onNext(args);

      ipc.on(channel, listener);

      return Disposable.create(() =>
        ipc.removeListener(channel, listener));
    });
  }
});
