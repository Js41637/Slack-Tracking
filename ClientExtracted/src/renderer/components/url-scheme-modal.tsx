/**
 * @module RendererComponents
 */ /** for typedoc */

import { shell } from 'electron';
import { Observable } from 'rxjs/Observable';
import * as url from 'url';
import { logger } from '../../logger';

import { UrlScheme, dialogActions } from '../../actions/dialog-actions';
import { settingActions } from '../../actions/setting-actions';
import { Component } from '../../lib/component';
import { settingStore } from '../../stores/setting-store';
import { Modal } from './modal';

import * as reactStringReplace from 'react-string-replace-recursively';
import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';

import * as React from 'react'; // tslint:disable-line

export interface UrlSchemeModalState {
  whitelistedUrlSchemes: Array<string>;
  locale: string;
}

export class UrlSchemeModal extends Component<UrlScheme, UrlSchemeModalState> {
  private readonly protocol: string | undefined;
  private confirmElement: HTMLElement;
  private whitelistElement: HTMLInputElement;

  private readonly refHandlers = {
    whitelist: (ref: HTMLInputElement) => this.whitelistElement = ref,
    confirm: (ref: HTMLElement) => this.confirmElement = ref
  };

  private readonly eventHandlers = {
    onCancel: () => this.handleCancel(),
    onConfirm: () => this.handleConfirm()
  };

  constructor() {
    super(...arguments);
    this.protocol = url.parse(this.props.url).protocol;
  }

  public syncState(): UrlSchemeModalState {
    return {
      locale: settingStore.getSetting<string>('locale'),
      whitelistedUrlSchemes: settingStore.getSetting<Array<string>>('whitelistedUrlSchemes')
    };
  }

   /**
    * Once the comoponent is mounted, make sure the user doesn't have to move a mouse
    * to interact with the form.
    */
  public componentDidMount(): void {
    this.confirmElement.focus();

    const escSubscription = Observable.fromEvent(document, 'keydown')
      .filter((e: KeyboardEvent) => e.key === 'Escape' || e.key === 'Esc')
      .subscribe(() => this.handleCancel());

    this.disposables.add(escSubscription);
  }

  public render(): JSX.Element | null {
    const protocolReplacementConfig = {
      statusPage: {
        pattern: this.protocol,
        matcherFn: (_rawText: string, _processed: string, key: any) => <code key={key}>{this.protocol}//</code>
      }
    };

    const protocolMessage = $intl.t('Always open links to {protocol}//', LOCALE_NAMESPACE.RENDERER)({
      protocol: this.protocol
    });
    const protocolElement = reactStringReplace(protocolReplacementConfig)(protocolMessage);

    return (
      <Modal
        className='UrlSchemeModal'
        width={480}
        height={258}
        transitionAppear={true}
      >
        <div className='UrlSchemeModal'>
          <div className='UrlSchemeModal-overlay'>
            <header><h4>{$intl.t('Open link to app', LOCALE_NAMESPACE.RENDERER)()}</h4></header>
            <p> {/* tslint:disable:max-line-length */}
              {$intl.t('This link opens an app, not a website. If that’s what you’re expecting, click on through. Otherwise, please make sure this is a link you trust.', LOCALE_NAMESPACE.RENDERER)()}
            </p>
            <label>
              <input type='checkbox' ref={this.refHandlers.whitelist} />
              {protocolElement}
            </label>
            <div className='url-scheme-buttons'>
              <button className='cancel' onClick={this.eventHandlers.onCancel}>{$intl.t('Cancel', LOCALE_NAMESPACE.GENERAL)()}</button>
              <button ref={this.refHandlers.confirm} onClick={this.eventHandlers.onConfirm}>
                {$intl.t('Open Link', LOCALE_NAMESPACE.GENERAL)()}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  /**
   * Handles the confirmation event. The uri is opened in either the user's browser
   * or any other protocol handler registered with the OS.
   */
  private handleConfirm(): void {
    try {
      logger.debug(`UrlSchemeModal: Opening external window to ${this.props.url}`);
      shell.openExternal(this.props.url, { activate: this.props.disposition !== 'background-tab' });
    } catch (error) {
      logger.warn(`UrlSchemeModal: Failed to open protocol link:`, error);
    }

    if (this.whitelistElement.checked) this.whitelistProtocol();
    dialogActions.hideUrlSchemeModal();
  }

  private handleCancel(): void {
    dialogActions.hideUrlSchemeModal();
  }

  /**
   * Whitelists the current url protocol
   */
  private whitelistProtocol(): void {
    const whitelistedUrlSchemes = this.state.whitelistedUrlSchemes;

    if (!this.protocol) {
      logger.warn('UrlSchemeModal: Attempted to whitelist undefined or not parseable url.');
      return;
    }

    if (whitelistedUrlSchemes.indexOf(this.protocol) < 0) {
      whitelistedUrlSchemes.push(this.protocol);
      settingActions.updateSettings({ whitelistedUrlSchemes });
    }
  }
}
