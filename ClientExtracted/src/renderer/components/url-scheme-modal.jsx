import React from 'react';
import logger from '../../logger';
import {shell} from 'electron';
import {Observable} from 'rxjs/Observable';
import url from 'url';

import AppActions from '../../actions/app-actions';
import SettingStore from '../../stores/setting-store';
import SettingActions from '../../actions/setting-actions';
import Component from '../../lib/component';
import Modal from '../../components/modal';

export default class UrlSchemeModal extends Component {
  static propTypes = {
    url: React.PropTypes.string.isRequired,
    disposition: React.PropTypes.string.isRequired
  };

  constructor() {
    super(...arguments);
    this.protocol = url.parse(this.props.url).protocol;
  }

  syncState() {
    return {
      whitelistedUrlSchemes: SettingStore.getSetting('whitelistedUrlSchemes')
    };
  }

   /**
   * Once the comoponent is mounted, make sure the user doesn't have to move a mouse
   * to interact with the form.
   */
  componentDidMount() {
    this.refs.confirm.focus();

    let escSubscription = Observable.fromEvent(document, 'keydown')
      .filter((e) => e.key === 'Escape' || e.key === 'Esc')
      .subscribe(() => this.handleCancel());

    this.disposables.add(escSubscription);
  }

  /**
   * Handles the confirmation event. The uri is opened in either the user's browser
   * or any other protocol handler registered with the OS.
   */
  handleConfirm() {
    try {
      logger.debug(`Opening external window to ${this.props.url}`);
      shell.openExternal(this.props.url, {activate: this.props.disposition !== 'background-tab'});
    } catch (error) {
      logger.warn(`Failed to open protocol link: ${error.message}`);
    }

    if (this.refs.whitelist.checked) this.whitelistProtocol();
    AppActions.hideUrlSchemeModal();
  }

  handleCancel() {
    AppActions.hideUrlSchemeModal();
  }

  /**
   * Whitelists the current url protocol
   */
  whitelistProtocol() {
    const whitelistedUrlSchemes = this.state.whitelistedUrlSchemes;

    if (!this.protocol) {
      logger.warn('Attempted to whitelist undefined or not parseable url');
      return;
    }

    if (whitelistedUrlSchemes.indexOf(this.protocol) < 0) {
      whitelistedUrlSchemes.push(this.protocol);
      SettingActions.updateSettings({whitelistedUrlSchemes});
    }
  }

  render() {
    return (
      <Modal className="UrlSchemeModal"
        width={480} height={258}
        transitionAppear={true}>
        <div className="UrlSchemeModal">
          <div className="UrlSchemeModal-overlay">
            <header><h4>Open link to app</h4></header>
            <p>This link opens an app, not a website. If that’s what you’re expecting, click on through. Otherwise, please make sure this is a link you trust.</p>
            <label>
              <input type="checkbox" ref="whitelist" />
              Always open links to <code>{this.protocol}//</code>
            </label>
            <div className="url-scheme-buttons">
              <button className="cancel" onClick={this.handleCancel.bind(this)}>Cancel</button>
              <button ref="confirm" onClick={this.handleConfirm.bind(this)}>Open Link</button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
