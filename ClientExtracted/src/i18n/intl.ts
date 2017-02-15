/**
 * Provides interface to lookup i18n translated ICU strings.
 * This modules provides identical interface to webapp
 * (https://slack-github.com/slack/docs/blob/master/i18n/javascript.md#overview)
 * (https://slack-github.com/slack/webapp/blob/master/js/TS.i18n.source.js)
 * to provide consistency but has different internal behavior tailored to electron app.
 *
 * DO NOT CHANGE INTERFACES UNTIL ABSOLUTELY NECESSARY
 */

import * as MessageFormat from 'message-format';
import {parseCommandLine} from '../parse-command-line';
import {StringMap} from '../utils/string-map';

export type translationFormatFunction = (...args: Array<any>) => string;

export type localeType = 'jp' | 'en-US';
export const LOCALE = {
  JP: 'jp' as localeType,
  US: 'en-US' as localeType
};

export type localeNamespaceType = 'general' | 'renderer' | 'browser' | 'menu' | 'messagebox';
export const LOCALE_NAMESPACE = {
  GENERAL: 'general' as localeNamespaceType,
  BROWSER: 'browser' as localeNamespaceType,
  RENDERER: 'renderer' as localeNamespaceType,
  MESSAGEBOX: 'messagebox' as localeNamespaceType,
  MENU: 'menu' as localeNamespaceType
};

/**
 * helper method for easier translation verification to show pseudo-translated strings
 * TODO: This function should be removed when actual translation is available
 */
function pseudoTranslate(value: string): string {
  const translate_re = /[aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY]/g;
  const translate = 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ';
  const translated = value.replace(translate_re,
    (match: string) => translate.substr(translate_re.source.indexOf(match) - 1, 1)
  );

  return translated;
}

export class TranslationLookup {
  private locale: localeType = LOCALE.US; //default to en
  private readonly defaultConjunction: string = ', ';
  private readonly namespaceTable: StringMap<StringMap<translationFormatFunction>> = {};
  private readonly pseudoTranslateEnabled: boolean = false;

  constructor() {
    const settings = global.loadSettings || parseCommandLine(); //ask global settings for renderer
    this.pseudoTranslateEnabled = !!(settings as any).i18nOverride && !!settings.devMode;
  }

  public initialize(locale: localeType): void {
    this.locale = locale;
    throw new Error('init to different locale is not supported yet');
  }

  /**
   * Returns function that will return translated string for current locale
   *
   * @param {String} key The English string which is also used as the key
   * @param {String} namespace Namespace for the key
   * @return {Function} The string translator function
   */
  public t(key: string, namespace: localeNamespaceType): translationFormatFunction {
    const translations = this.loadTranslationFrom(namespace);

    const translation = translations[key];
    if (!translation) {
      const formatter = new MessageFormat(this.locale, key).format;
      translations[key] = this.pseudoTranslateEnabled ? (arg: Object) => pseudoTranslate(formatter(arg)) : formatter;
    }
    return translations[key];
  }

  /**
   * Returns a number in it's localized form, e.g. 1000 > 1,000
   *
   * @param {Number} num The number to transform
   * @return {String} The number in it's localized form
   */
  public number(num: number): string {
    return new Intl.NumberFormat(this.locale).format(num);
  }

  /**
   * Takes an array of strings and returns a new array including the
   * original strings and the appropriate separator for the current locale
   *
   * @param {Array} arr An array of strings, e.g. ['foo', 'bar', 'baz']
   * @param {String} conj A string used to specify if the joining conjunction
   *                      should be 'or' instead of 'and'
   * @return {Array} An array of including the original string and appropriate separators
   *                 e.g. for English, ['foo', ', ', 'bar', ' and ', 'baz']
   */
  public listify(arr: Array<string>, conj: 'or' | 'and' = 'and'): Array<string> {
    let and: string;
    const arrayLength = arr.length;
    const conjunction = (conj === 'or') ? this.t('or', LOCALE_NAMESPACE.GENERAL)() : this.t('and', LOCALE_NAMESPACE.GENERAL)();
    const oxford = (arrayLength > 2) ? ',' : '';

    // todo: add to this as we get new locales
    switch (this.locale) {
      case LOCALE.JP:
        and = this.defaultConjunction;
        break;

      default: // default for English, French, Spanish etc
        and = `${oxford} ${conjunction} `;
    }

    return arr.reduce((acc: Array<string>, value: string, index: number) => {
      acc.push(value);

      if (index < arrayLength - 2) {
        acc.push(this.defaultConjunction);
      } else if (index < arrayLength - 1) {
        acc.push(and);
      }
      return acc;
    }, []);
  }

  private loadTranslationFrom(namespace: localeNamespaceType): StringMap<translationFormatFunction> {
    let table = this.namespaceTable[namespace];
    if (!table) {
      table = this.namespaceTable[namespace] = {};
    }
    return table;
  }
}

const intl = new TranslationLookup();
export {
  intl
};
