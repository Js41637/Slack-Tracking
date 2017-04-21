/**
 * @module i18n
 */ /** for typedoc */

import { app, remote } from 'electron';

export interface LocaleConfiguration {
  /**
   * Current application's locales inherited by system locale preferences. By default it tries to read system locale via `l10n_util`
   * in Chromium, possibly returns locale list at https://github.com/electron/electron/blob/master/docs/api/locales.md#locales.
   */
  readonly systemLocale: string;

  /**
   * Current system's region, if available.
   *
   */
  readonly systemRegion: string;
}

export class Locale {
  private localeConfig: LocaleConfiguration | null = null;

  public get currentLocale(): LocaleConfiguration {
    if (!this.localeConfig) {
      this.localeConfig = {
        systemLocale: this.systemLocale,
        systemRegion: this.systemRegion
      };
    }

    return this.localeConfig;
  }

  /**
   * clear all memoized values and try to read new locale values from
   * sources (system, user preferences, etcs). This'll invoke `app.getLocale` method,
   * so should be called under context where application instance is available.
   */
  public invalidate(): LocaleConfiguration {
    this.localeConfig = null;
    return this.currentLocale;
  }

  private get systemLocale(): string {
    const main = app || remote.app;

    if (!!main) {
      if (main.isReady()) {
        return main.getLocale();
      }
      throw new Error('cannot read exact locale before application instance is ready');
    }

    throw new Error('cannot locate main process instance, check context');
  }

  /**
   * Returns locale preferences user defined.
   *
   * Note: as UX flow is not fully defined yet, this function currently does not return anything
   */
  private get userLocale(): string {
    return '';
  }

  /**
   * Returns system region information if available.
   */
  private get systemRegion(): string {
    return '';
  }
}

const locale = new Locale();
export {
  locale
};
