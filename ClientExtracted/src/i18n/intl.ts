/**
 * @module i18n
 */ /** for typedoc */

/**
 * Provides interface to lookup i18n translated ICU strings.
 * This modules provides identical interface to webapp
 * (https://slack-github.com/slack/docs/blob/master/i18n/javascript.md#overview)
 * (https://slack-github.com/slack/webapp/blob/master/js/TS.i18n.source.js)
 * to provide consistency but has different internal behavior tailored to electron app.
 *
 * DO NOT CHANGE INTERFACES UNTIL ABSOLUTELY NECESSARY
 */

import * as fs from 'fs';
import * as MessageFormat from 'message-format';
import * as path from 'path';
import { logger } from '../logger';
import { getHashCode } from '../utils/get-hash-code';
import { StringMap } from '../utils/shared-constants';
import { LOCALE_NAMESPACE, localeNamespaceType } from './locale-namespace';

type stringFormatterFunction = (...args: Array<any>) => string;

export type localeType = 'jp' | 'en-US';
export const LOCALE = {
  JP: 'jp' as localeType,
  US: 'en-US' as localeType
};

interface LocaleResource {
  translation: string;
  notes: string;
}

class TranslationLookup {
  private static defaultLocale: localeType | string = LOCALE.US.substring(0, 2);
  private locale: localeType | string = TranslationLookup.defaultLocale;
  private readonly defaultConjunction: string = ', ';
  private readonly defaultStringFormatterTable: Partial<Record<localeNamespaceType, StringMap<stringFormatterFunction>>> = {};
  private stringFormatterTable: Partial<Record<localeNamespaceType, StringMap<stringFormatterFunction>>> = {};
  private localeResourceTable: Partial<Record<localeNamespaceType, StringMap<LocaleResource>>> = {};


  /**
   * Apply locale into translation module to lookup string for given locale
   * by clearing existing formatter lookup table and create new formatter based on new locale.
   *
   * Note this won't affect string already formatted by previous formatters - to replace those strings
   * it need to be explicitly reloaded.
   *
   * @param {String} locale language code to apply for further string lookup
   */
  public applyLocale(locale: string): void {
    //default namespace table (English) won't be cleared once generated
    this.stringFormatterTable = {};
    this.localeResourceTable = {};

    if (!locale || locale.length < 2) {
      throw new Error(`Invalid locale code ${locale} specified`);
    }

    //we do not apply region codes yet into translated strings, stripping it out
    this.locale = locale.substring(0, 2);
    logger.info(`TranslationLookup: locale set to ${locale} for ${process.type}`);
  }

  /**
   * Returns function allows ICU formatting message (http://userguide.icu-project.org/formatparse/messages)
   * based on current locale specifed.
   *
   * @param {String} value Default string originally composed, English
   * @param {String} namespace Namespace for the key
   * @return {stringFormatterFunction} The string translator function
   */
  public t(value: string, namespace: localeNamespaceType): stringFormatterFunction {
    const key = getHashCode(value);

    const cachedFormatter = this.lookupStringFormatter(namespace, key);
    if (cachedFormatter) {
      return cachedFormatter;
    }

    const translatedStringValue = this.translate(namespace, key) || value;
    const formatter = new MessageFormat(this.locale, translatedStringValue).format;
    this.updateFormatter(namespace, key, formatter);
    return formatter;
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

  /**
   * Find string formatter function if exists in current lookup table.
   *
   * @param {localeNamespaceType} namespace namespace of string value
   * @param {number} key key to lookup formatter function, hashcode of original string
   * @return {stringFormatterFunction | null} translator function, or null if not exist
   */
  private lookupStringFormatter(namespace: localeNamespaceType, key: number): stringFormatterFunction | null {
    const table = this.locale === TranslationLookup.defaultLocale ? this.defaultStringFormatterTable : this.stringFormatterTable;
    const namespaceTable = table[namespace];

    return namespaceTable ? namespaceTable[key] : null;
  }

  /**
   * Fill in corresponding namespace's locale resource with empty dictionary.
   * This will prevent continious subsequent file system lookup
   * If loading resources for given namespace failed for some reason
   * @param namespace
   */
  private updateEmptyLocaleDictionary(namespace: localeNamespaceType): StringMap<LocaleResource> {
    logger.warn(`TranslationLookup: locale lookup for ${namespace} will be skipped until applying new locales`);
    return this.localeResourceTable[namespace] = {};
  }

  private loadLocaleResource(namespace: localeNamespaceType): StringMap<LocaleResource> {
    //first, lookup stored resource first
    if (this.localeResourceTable[namespace]) {
      return this.localeResourceTable[namespace]!;
    }

    const setEmptyDict = () => this.updateEmptyLocaleDictionary(namespace);
    logger.debug(`TranslationLookup: trying to load locale resources for ${namespace}_${this.locale}`);

    const resourcePath = path.resolve(__dirname, 'resources', this.locale);

    if (!fs.statSyncNoException(resourcePath)) {
      logger.info(`TranslationLookup: resource for ${this.locale} is not available at ${resourcePath}`);
      return setEmptyDict();
    }

    let resources: Array<string>;
    try {
      resources = fs.readdirSync(resourcePath);
    } catch (e) {
      logger.error(`TranslationLookup: failed to lookup resources for ${this.locale}`, e);
      return setEmptyDict();
    }

    if (!resources || resources.length === 0) {
      logger.error(`TranslationLookup: there are no resources exist, something went wrong`);
      return setEmptyDict();
    }

    //as we're ignoring region codes for now, find any matching translated resource
    const resourceFileName = resources.filter((file) => file.match(new RegExp(`${namespace}_${this.locale}.+\\.json`)));

    if (resourceFileName.length !== 1) {
      logger.error(`TranslationLookup: could not find corresponding local resources for ${namespace}_${this.locale}`, resourceFileName);
      return setEmptyDict();
    }

    let resource: StringMap<LocaleResource>;
    try {
      resource = require(path.join(resourcePath, resourceFileName[0]));
    } catch (e) {
      logger.error(`TranslationLookup: failed to load resources from ${resourceFileName[0]}`, e);
      return setEmptyDict();
    }

    return this.localeResourceTable[namespace] = resource;
  }

  /**
   * Find translated string corresponds to given key and namespaces.
   *
   * @param {localeNamespaceType} namespace namespace of string value
   * @param {number} key key to lookup formatter function, hashcode of original string
   */
  private translate(namespace: localeNamespaceType, key: number): string | null {
    //default locale does not need to lookup translated resources
    if (this.locale === TranslationLookup.defaultLocale) {
      return null;
    }

    const translateValue = this.loadLocaleResource(namespace)[key];

    //empty dictionary by failing load resources, fall back to default locale simply
    if (!translateValue) {
      return null;
    }

    if (!translateValue.translation || translateValue.translation.length === 0) {
      logger.error(`TranslationLookup: loaded resources are corrupted, does not contain locale values for ${namespace}_${key}`);
      return null;
    }

    return translateValue.translation;
  }

  /**
   * Store given formatter function into lookup table.
   *
   * @param {localeNamespaceType} namespace namespace of string value
   * @param {number} key key to lookup formatter function, hashcode of original string
   * @param {stringFormatterFunction} formatter formatter to be stored
   */
  private updateFormatter(namespace: localeNamespaceType, key: number, formatter: stringFormatterFunction): void {
    const table = this.locale === TranslationLookup.defaultLocale ? this.defaultStringFormatterTable : this.stringFormatterTable;
    let namespaceTable = table[namespace];
    if (!namespaceTable) {
      namespaceTable = table[namespace] = {};
    }

    namespaceTable[key] = formatter;
  }
}

const intl = new TranslationLookup();
export {
  stringFormatterFunction,
  localeNamespaceType,
  LOCALE_NAMESPACE,
  TranslationLookup,
  intl
};
