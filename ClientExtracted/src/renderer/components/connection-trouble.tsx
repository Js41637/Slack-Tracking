/**
 * @module RendererComponents
 */ /** for typedoc */

import { shell } from 'electron';
import * as React from 'react';
import * as reactStringReplace from 'react-string-replace-recursively';

import { eventActions } from '../../actions/event-actions';
import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { LastError } from '../../utils/shared-constants';

export interface ConnectionTroubleProps {
  reloadApp: () => void;
  openStatusPage: () => void;
  lastError?: LastError | null;
}

export class ConnectionTrouble extends Component<ConnectionTroubleProps> {
  private readonly statusReplacementLinkConfig = {
    statusPage: {
      pattern: /(check the status of our servers)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.props.openStatusPage}>{processed}</a>
    }
  };

  private readonly reloadSlackLinkConfig = {
    reloadSlack: {
      pattern: /(Reload Slack)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.props.reloadApp}>{processed}</a>
    }
  };

  private readonly checkConsoleOrSupportConfig = {
    openDevTools: {
      pattern: /(Console)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.openDevTools}>{processed}</a>
    },
    showLogsInFinder: {
      pattern: /(app logs)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.showLogsInFinder}>{processed}</a>
    },
    openSupportPage: {
      pattern: /(drop us a line)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.openSupportPage}>{processed}</a>
    }
  };

  /**
   * Whenever we encounter an error, we store it in the app store's "lastError" property.
   * This allows us to display the last encountered error to the user, thus giving at least
   * a hint around what could have gone wrong. This method renders an error if it exists, or
   * returns null if it doesn't.
   *
   * @returns {(JSX.Element | null)}
   */
  public renderLastError(): JSX.Element | null {
    const { lastError } = this.props;

    if (lastError) {
      const explanation = $intl.t('The last error we encountered had the code', LOCALE_NAMESPACE.RENDERER)();
      const { errorCode } = lastError;
      const description = lastError.errorDescription ? `(${lastError.errorDescription})` : '';
      const error = `${errorCode} ${description}`.trim();

      return (
        <li>{explanation} <code>{error}</code></li>
      );
    }

    return null;
  }

  public render(): JSX.Element | null {
    const serverStatusMessage = $intl.t('We’re quite sorry about this! Before you try to troubleshoot, please do check the status of our servers.',
      LOCALE_NAMESPACE.GENERAL)();
    const reloadSlackMessage = $intl.t('Reload Slack, or even restart the app.', LOCALE_NAMESPACE.GENERAL)();
    const checkConsoleOrSupportMessage = $intl.t('Check your Console or app logs for errors, and drop us a line for more help.',
      LOCALE_NAMESPACE.GENERAL)();

    const checkServerStatusElement = reactStringReplace(this.statusReplacementLinkConfig)(serverStatusMessage);
    const reloadSlackElement = reactStringReplace(this.reloadSlackLinkConfig)(reloadSlackMessage);
    const checkConsoleOrSupportElement = reactStringReplace(this.checkConsoleOrSupportConfig)(checkConsoleOrSupportMessage);

    return (
      <div id='trouble_loading'>
        <h1>{$intl.t('For some reason, Slack couldn’t load ', LOCALE_NAMESPACE.RENDERER)()}<span title="'Face With Cold Sweat' emoji">😓</span></h1>
        <p>{checkServerStatusElement}</p>

        <h3>Troubleshooting</h3>

        <div className='trouble_loading_content'>
          <p>{$intl.t('A few things to try:', LOCALE_NAMESPACE.RENDERER)()}</p>

          <ul>
            <li>{reloadSlackElement}</li>
            <li>{$intl.t('Make sure your security software isn’t blocking Slack.', LOCALE_NAMESPACE.RENDERER)()}</li>
            <li>{checkConsoleOrSupportElement}</li>
            {this.renderLastError()}
          </ul>
        </div>
      </div>
    );
  }

  private openDevTools(): void {
    eventActions.toggleDevTools();
  }

  private openSupportPage(): void {
    shell.openExternal('https://slack.com/help/requests/new');
  }

  private showLogsInFinder(): void {
    eventActions.prepareAndRevealLogs();
  }
}
