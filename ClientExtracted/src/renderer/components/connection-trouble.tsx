/**
 * @module RendererComponents
 */ /** for typedoc */

import { shell } from 'electron';
import * as React from 'react'; // tslint:disable-line
import * as reactStringReplace from 'react-string-replace-recursively';

import { Component } from '../../lib/component';
import { eventActions } from '../../actions/event-actions';
import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

export interface ConnectionTroubleProps {
  reloadApp: () => void;
  openStatusPage: () => void;
}

export interface ConnectionTroubleState {
}

export class ConnectionTrouble extends Component<ConnectionTroubleProps, ConnectionTroubleState> {
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

  public render(): JSX.Element | null {
    const serverStatusMessage = $intl.t(`We’re quite sorry about this! Before you try to troubleshoot, please do check the status of our servers.`,
      LOCALE_NAMESPACE.GENERAL)();
    const reloadSlackMessage = $intl.t(`Reload Slack, or even restart the app.`, LOCALE_NAMESPACE.GENERAL)();
    const checkConsoleOrSupportMessage = $intl.t(`Check your Console or app logs for errors, and drop us a line for more help.`,
      LOCALE_NAMESPACE.GENERAL)();

    const checkServerStatusElement = reactStringReplace(this.statusReplacementLinkConfig)(serverStatusMessage);
    const reloadSlackElement = reactStringReplace(this.reloadSlackLinkConfig)(reloadSlackMessage);
    const checkConsoleOrSupportElement = reactStringReplace(this.checkConsoleOrSupportConfig)(checkConsoleOrSupportMessage);

    return (
      <div id='trouble_loading'>
        <h1>{$intl.t(`For some reason, Slack couldn’t load `, LOCALE_NAMESPACE.RENDERER)()}<span title="'Face With Cold Sweat' emoji">😓</span></h1>
        <p>{checkServerStatusElement}</p>

        <h3>Troubleshooting</h3>

        <div className='trouble_loading_content'>
          <p>{$intl.t(`A few things to try:`, LOCALE_NAMESPACE.GENERAL)()}</p>

          <ul>
            <li>{reloadSlackElement}</li>
            <li>{$intl.t(`Make sure your security software isn’t blocking Slack.`, LOCALE_NAMESPACE.RENDERER)()}</li>
            <li>{checkConsoleOrSupportElement}</li>
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