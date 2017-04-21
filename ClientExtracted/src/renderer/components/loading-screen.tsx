/**
 * @module RendererComponents
 */ /** for typedoc */

import { shell } from 'electron';

import * as React from 'react'; // tslint:disable-line
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as reactStringReplace from 'react-string-replace-recursively';

import { appStore } from '../../stores/app-store';
import { Component } from '../../lib/component';
import { ConnectionTrouble } from './connection-trouble';
import { eventActions } from '../../actions/event-actions';
import { networkStatusType } from '../../utils/shared-constants';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

export interface LoadingScreenProps {
  className?: string;
  hasConnectionTrouble?: boolean;
}

export interface LoadingScreenState {
  networkStatus: networkStatusType;
}

export class LoadingScreen extends Component<LoadingScreenProps, LoadingScreenState> {
  public static readonly defaultProps: LoadingScreenProps = {
    className: 'Startup'
  };

  private readonly statusPageReplaceConfig = {
    statusPage: {
      pattern: /(status page)/,
      matcherFn: (_text: string, processed: string, key: any) =>
        <a key={key} onClick={this.openStatusPage} className='LoadingScreen-link'>{processed}</a>
    }
  };

  public syncState(): Partial<LoadingScreenState> {
    return {
      networkStatus: appStore.getNetworkStatus()
    };
  }

  public render(): JSX.Element | null {
    const { networkStatus } = this.state;
    let { hasConnectionTrouble } = this.props;
    hasConnectionTrouble = hasConnectionTrouble || networkStatus === 'connectionTrouble';

    const content = hasConnectionTrouble ? (
      <ConnectionTrouble
        reloadApp={this.reloadApp}
        openStatusPage={this.openStatusPage}
      />
    ) : this.contentForStatus(networkStatus);

    return (
      <ReactCSSTransitionGroup
        component='div'
        className={`LoadingScreen ${this.props.className}`}
        transitionName='anim'
        transitionEnter={false}
        transitionLeave={false}
        transitionAppear={true}
        transitionAppearTimeout={500}
      >
        {content}
      </ReactCSSTransitionGroup>
    );
  }

  private contentForStatus(networkStatus: string): JSX.Element | null {
    switch (networkStatus) {
    case 'offline':
      return this.renderOfflineStatus();
    case 'slackDown':
      return this.renderSlackDownStatus();
    default:
      return this.renderConnectingStatus();
    }
  }

  private renderConnectingStatus(): JSX.Element {
    return (
      <div className='LoadingScreen-centerColumn'>
        <img width='90' height='90' srcSet='trying.webp 1x, trying@2x.webp 2x' />
        <div>{$intl.t(`Connecting ...`, LOCALE_NAMESPACE.RENDERER)()}</div>
      </div>
    );
  }

  private renderOfflineStatus(): JSX.Element {
    return (
      <div className='LoadingScreen-centerColumn'>
        <img width='362' height='102' src='./offline.webp'/>
        <div className='LoadingScreen-title'>{$intl.t(`Slack can’t connect`, LOCALE_NAMESPACE.RENDERER)()}</div>
        <div style={{ marginTop: '8px' }}>
          {$intl.t(`Either your computer is offline, or Slack is having problems of its own.`, LOCALE_NAMESPACE.RENDERER)()}
        </div>
        <div style={{ marginTop: '2px' }}>{this.renderCheckStatusPageMessage()}</div>
        <div style={{ marginTop: '16px' }}>
          <a className='LoadingScreen-button' onClick={this.reloadApp}>{$intl.t(`Try now`, LOCALE_NAMESPACE.RENDERER)()}</a>
        </div>
      </div>
    );
  }

  private renderSlackDownStatus(): JSX.Element {
    return (
      <div className='LoadingScreen-centerColumn'>
        <img width='200' height='200' src='./slackdown.webp'/><br/>
        <div className='LoadingScreen-title'>{$intl.t(`The Slack service is unavailable`, LOCALE_NAMESPACE.RENDERER)()}</div>
        <div style={{ marginTop: '8px' }}>{this.renderCheckStatusPageMessage()}</div>
        <div style={{ marginTop: '16px' }}>
          <a className='LoadingScreen-button' onClick={this.reloadApp}>{$intl.t(`Try now`, LOCALE_NAMESPACE.RENDERER)()}</a>
        </div>
      </div>
    );
  }

  private renderCheckStatusPageMessage() {
    const checkStatusPageMessage = $intl.t(`Check our status page for updates, and we’ll keep trying to reconnect.`,
      LOCALE_NAMESPACE.GENERAL)();

    return reactStringReplace(this.statusPageReplaceConfig)(checkStatusPageMessage);
  }

  private reloadApp(): void {
    eventActions.reload(true);
  }

  private openStatusPage(): void {
    shell.openExternal('https://status.slack.com');
  }
}
