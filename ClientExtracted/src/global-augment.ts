/**
 * @hidden
 */ /** for typedoc */


// We've injected custom flavored bugsnag setup, so only import type definition
// tslint:disable-line:no-reference
/// <reference path="../node_modules/@types/bugsnag/index.d.ts" />
import { BaseStore } from './lib/base-store';
import { WebappWindowManager } from './ssb/webapp-window-manager';
import { AppIntegration } from './ssb/app';
import { ClipboardIntegration } from './ssb/clipboard';
import { DockIntegration } from './ssb/dock';
import { NotificationIntegration } from './ssb/notify';
import { DownloadIntegration } from './ssb/downloads';
import { Stats } from './ssb/stats';
import { Calls } from './ssb/calls';
import { DeviceStorage } from './ssb/device-storage';
import { windowType } from './utils/shared-constants';
import { LoggerConfiguration } from './logger-configuration';
import { BugsnagReporter } from './browser/bugsnag-reporter';
import { getMemoryUsage } from './memory-usage';
import { ReduxHelper } from './ssb/redux-helper';
import { SpellCheckingHelper } from './ssb/spell-checking';
import { TouchBarIntegration } from './ssb/touchbar';

// https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#augmenting-globalmodule-scope-from-modules

export interface LoadSettings extends LoggerConfiguration {
  testMode: boolean;
  windowType: windowType;
  devEnv: string;
  resourcePath?: string;
  version?: string;
}

export interface Desktop {
  browserWindowId?: number;
  teams: {
    fetchContentForChannel(retry: number): void;
  };
  reduxHelper: ReduxHelper;
  spellCheckingHelper?: SpellCheckingHelper;
  ls?: Storage;
  window: WebappWindowManager;
  guestInstanceId?: string;
  app: AppIntegration;
  clipboard: ClipboardIntegration;
  dock: DockIntegration;
  notice: NotificationIntegration;
  downloads: DownloadIntegration;
  stats: Stats;
  calls: Calls | null;
  screenhero: Calls | null;
  store: BaseStore<any>;
  deviceStorage: DeviceStorage;
  touchbar?: TouchBarIntegration;
}

/* tslint:disable */
//Augument global-scope interfaces
declare global {
  //define globally patched winssb interface
  interface Window {
    winssb: Desktop;
    desktop: Desktop;

    slackCore: {
      getLinuxDistro: () => Promise<null>;
    };

    //define globally patched TSSSB interface
    TSSSB: {
      downloadMetadataChanged(): void;
      downloadWithTokenDidSelectFilepath(token: string, filePath: string): void;
      canUrlBeOpenedInSSBWindow(url: string): boolean;
      getThemeValues(): any;
      recentMessagesFromCurrentChannel(): {msgs: Array<any>};
      showUpdateBanner: (option: {
        canUpdate: boolean;
        learnMoreUrl: string;
        releaseVersion: string
      }) => void;
      systemTextSettingsChanged(): void;
      customMenuItemClicked(itemId: string | null): void;
    };

    //define globally patched TS interface
    TS: {
      model: {
        win_ssb_version: number;
        win_ssb_version_minor: number;
      },
      boot_data: {
        feature_interactive_win_notifs: boolean | undefined;
      }
    };

    teamId?: string;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    Bugsnag: BugsnagStatic;
  }

  namespace Electron {
    interface CommonElectron {
      TouchBar: any;
    }

    interface BrowserWindow {
      exitApp?: boolean;
      closed: boolean;
      setTouchBar: (touchBar: any) => void;
    }

    //augument until type definition being updated.
    //https://github.com/electron/electron/blob/master/docs/api/menu-item.md#new-menuitemoptions
    interface MenuItem {
      id?: string;
    }

    interface DidFailLoadArguments {
      event: Event;
      errorCode: number;
      errorDescription: string;
      validatedURL: string;
      isMainFrame: boolean;
    }

    interface DidGetResponseDetailsArguments {
      event: Event;
      status: boolean;
      newURL: string;
      originalURL: string;
      httpResponseCode: number;
      requestMethod: string;
      referrer: string;
      headers: any;
      resourceType: string;
    }
  }

  namespace NodeJS {
    interface Global {
      loadSettings: LoadSettings;
      navigator: {
        userAgent: string;
      },
      localStorage: Storage;
      shellStartTime: number;
      secondaryParamsReceived: Array<string>;
      secondaryParamsHandler: (cmd: Array<string>) => void;
      application: any;
      reporter: BugsnagReporter;
      getMemoryUsage: typeof getMemoryUsage;
      document: Document;
      window: Window;
      debugProfiler: any;
      Bugsnag: BugsnagStatic;
    }

    interface Process {
      guestInstanceId: string;
    }
  }

  //augument JSX IntrinsicElements for custom elements
  namespace JSX {
    interface IntrinsicElements {
      webview: any;
      center: any;
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
