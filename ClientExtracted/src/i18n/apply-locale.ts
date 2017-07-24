import { intl as $intl } from './intl';
import { locale } from './locale';

/**
 * Apply specified locale into `intl` module, allows to lookup strings with given locale.
 *
 * For now this interface simply honors system locale only by default.
 */
export function applyLocale(): void {
  const localeConfig = locale.currentLocale;
  $intl.applyLocale(localeConfig.systemLocale);
}
