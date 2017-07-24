/**
 * @module LOCALE_NAMESPACE
 */ /** for typedoc */

/**
 * Defines types of namespace for localized strings.
 * Each types corresponds to separate JSON string resources.
 */
export type localeNamespaceType =
  'desktop_general' | 'desktop_renderer' |
  'desktop_browser' | 'desktop_menu' |
  'desktop_messagebox';

export const LOCALE_NAMESPACE = {
  GENERAL: 'desktop_general' as localeNamespaceType,
  BROWSER: 'desktop_browser' as localeNamespaceType,
  RENDERER: 'desktop_renderer' as localeNamespaceType,
  MESSAGEBOX: 'desktop_messagebox' as localeNamespaceType,
  MENU: 'desktop_menu' as localeNamespaceType
};
