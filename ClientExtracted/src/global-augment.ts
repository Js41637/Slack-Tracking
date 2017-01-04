import {windowType} from './utils/shared-constants';
import {LoggerConfiguration} from './logger-configuration';

// https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#augmenting-globalmodule-scope-from-modules

export interface LoadSettings extends LoggerConfiguration {
  testMode: boolean;
  windowType: windowType;
}

/* tslint:disable */
//Augument global-scope interfaces
declare global {
  namespace Electron {
    interface BrowserWindow {
      exitApp?: boolean;
    }

    //These interfaces are only until @types/electron updates to latest electron version
    interface Clipboard {
      writeFindText(text: string): void;
      readFindText(): string | null;
    }
  }

  namespace NodeJS {
    interface Global {
      loadSettings: LoadSettings;
    }

    interface Process {
      guestInstanceId: string;
    }
  }
}

//augument named module interfaces
declare module 'graceful-fs' {
  function statSyncNoException(path: string | Buffer): Stats;
}
/* tslint:enable */

// ensure this is treated as a module.
export {};
