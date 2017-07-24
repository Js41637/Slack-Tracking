/**
 * @module RendererComponents
 */ /** for typedoc */

import { shell } from 'electron';
import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as reactStringReplace from 'react-string-replace-recursively';

import { eventActions } from '../../actions/event-actions';
import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { appStore } from '../../stores/app-store';
import { LastError, networkStatusType } from '../../utils/shared-constants';
import { ConnectionTrouble } from './connection-trouble';

export interface LoadingScreenProps {
  className?: string;
  hasConnectionTrouble?: boolean;
}

export interface LoadingScreenState {
  networkStatus: networkStatusType;
  lastError: LastError | null;
}

export class LoadingScreen extends Component<LoadingScreenProps, LoadingScreenState> {
  public static readonly defaultProps: LoadingScreenProps = {
    className: 'Startup'
  };

  private readonly statusLinkElementReplaceConfig = {
    statusPage: {
      pattern: /status.slack.com/,
      matcherFn: (_rawText: string, _processed: string, key: any) =>
        <a key={key} href='http://status.slack.com' onClick={this.openStatusPage}>status.slack.com.</a>
    }
  };

  public syncState(): Partial<LoadingScreenState> {
    return {
      networkStatus: appStore.getNetworkStatus(),
      lastError: appStore.getLastError()
    };
  }

  public render(): JSX.Element | null {
    const { networkStatus, lastError } = this.state;
    let { hasConnectionTrouble } = this.props;
    hasConnectionTrouble = hasConnectionTrouble || networkStatus === 'connectionTrouble';

    const content = hasConnectionTrouble ? (
      <ConnectionTrouble
        reloadApp={this.reloadApp}
        openStatusPage={this.openStatusPage}
        lastError={lastError}
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
      <div className='LoadingScreen-connecting'>
        <img width='90' height='90' srcSet='trying.webp 1x, trying@2x.webp 2x' />
        <span className='LoadingScreen-text'>{$intl.t('Connecting ...', LOCALE_NAMESPACE.RENDERER)()}</span>
      </div>
    );
  }

  private renderOfflineStatus(): JSX.Element {
    return (
      <div className='LoadingScreen-noService'>
        <img width='362' height='102' src='./offline.webp'/>
        <span className='LoadingScreen-text'>
          {$intl.t('It appears you don’t have an internet connection right now.', LOCALE_NAMESPACE.RENDERER)()}<br/>
          <span style={{ color: '#4c9689' }}>{$intl.t('Slack will attempt to automatically reconnect.', LOCALE_NAMESPACE.RENDERER)()}</span>
            <br/><br/>
            <center>
              <a className='LoadingScreen-button' onClick={this.reloadApp}>{$intl.t('Try now', LOCALE_NAMESPACE.RENDERER)()}</a>
            </center>
        </span>
      </div>
    );
  }

  private renderSlackDownStatus(): JSX.Element {
    const slackDownTranslatedMessage = $intl.t('The Slack service appears to be unavailable. Please check status.slack.com.',
      LOCALE_NAMESPACE.GENERAL)();

    //message-format returns translated string as plain string and does not provide escape hatch for JSX element,
    //post-process translated string to attach <a/>
    const downMesssageElement = reactStringReplace(this.statusLinkElementReplaceConfig)(slackDownTranslatedMessage);

    return (
      <div className='LoadingScreen-offline'>
        <img width='284' height='284' src='./slackdown.webp'/><br/>
        <span className='LoadingScreen-text'>
          {downMesssageElement}
          <br/><br/>
          <center>
            <a className='LoadingScreen-button' onClick={this.reloadApp}>{$intl.t('Try now', LOCALE_NAMESPACE.RENDERER)()}</a>
          </center>
        </span>
      </div>
    );
  }

  private reloadApp(): void {
    eventActions.reload(true);
  }

  private openStatusPage(): void {
    shell.openExternal('https://status.slack.com');
  }
}
