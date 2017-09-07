/**
 * @hidden
 */ /** for typedoc */


// We've injected custom flavored bugsnag setup, so only import type definition
// tslint:disable-line:no-reference
/// <reference path="../node_modules/@types/bugsnag/index.d.ts" />
import { BugsnagReporter } from './browser/bugsnag-reporter';
import { BaseStore } from './lib/base-store';
import { LoggerConfiguration } from './logger-configuration';
import { getMemoryUsage } from './memory-usage';
import { DownloadsList } from './reducers/downloads-reducer';
import { AppIntegration } from './ssb/app';
import { Calls } from './ssb/calls';
import { ClipboardIntegration } from './ssb/clipboard';
import { DeviceStorage } from './ssb/device-storage';
import { DockIntegration } from './ssb/dock';
import { DownloadIntegration } from './ssb/downloads';
import { NativeImageIntegration } from './ssb/native-image';
import { NotificationIntegration } from './ssb/notify';
import { ReduxHelper } from './ssb/redux-helper';
import { SpellCheckingHelper } from './ssb/spell-checking';
import { Stats } from './ssb/stats';
import { TouchBarIntegration } from './ssb/touchbar';
import { WebappWindowManager } from './ssb/webapp-window-manager';
import { windowType } from './utils/shared-constants';

// https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#augmenting-globalmodule-scope-from-modules

export interface LoadSettings extends LoggerConfiguration {
  testMode: boolean;
  windowType: windowType;
  devEnv: string;
  resourcePath?: string;
  version?: string;
  sessionId: string;
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
  screen: Electron.Screen;
  screenhero: Calls | null;
  store: BaseStore;
  deviceStorage: DeviceStorage;
  touchbar?: TouchBarIntegration;
  nativeImage: NativeImageIntegration;
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
      teamSelectionChanged(selectedTeamId: string): void;
      updateDownloadsView(downloads?: DownloadsList): void;
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

    Notification: any;
  }

  namespace Electron {

    interface BrowserWindow {
      exitApp?: boolean;
      closed: boolean;
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
      ga: (...args:Array<any>) => void;
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
