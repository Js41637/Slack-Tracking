import assignIn from 'lodash.assignin';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

const ipc = require('electron')[process.type === 'renderer' ?
  'ipcRenderer': 'ipcMain'];

export default assignIn({}, ipc, {
  listen: (channel) => {
    return Observable.create((subj) => {

      let listener = process.type === 'browser' ?
        (event, args) => subj.next(args) :
        (...args) => subj.next(args);

      ipc.on(channel, listener);

      return new Subscription(() =>
        ipc.removeListener(channel, listener));
    });
  }
});
