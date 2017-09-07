/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { clipboard, shell } from 'electron';
import * as packageJson from '../../../package.json';
import { ContextMenuBuilder } from '../../context-menu';
import { ContextMenuListener } from '../../context-menu-listener';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { settingStore } from '../../stores/setting-store';

import * as React from 'react';
import { IS_STORE_BUILD } from '../../utils/shared-constants';

//since P can't be optional while S exists, so just allows empty interface
export interface AboutBoxProps { } //tslint:disable-line:no-empty-interface

export interface AboutBoxState {
  appVersion: string;
  versionName: string;
  copyright: string;
  commit: string;
  branch: string;
  releaseChannel: string;
  isMac: boolean;
  isWindows: boolean;
  showTooltip: boolean;
  locale: string;
}

export class AboutBox extends Component<AboutBoxProps, Partial<AboutBoxState>> {
  private contextMenuListener: ContextMenuListener | null;
  private acknowledgementsElement: HTMLElement;
  private versionElement: HTMLElement;
  private readonly refHandlers = {
    acknowledgements: (ref: HTMLElement) => this.acknowledgementsElement = ref,
    version: (ref: HTMLElement) => this.versionElement = ref,
  };

  private readonly eventHandlers = {
    onCopyVersion: () => this.copyVersion(),
    onShowDependencies: () => this.showDependencies()
  };

  public syncState(): Partial<AboutBoxState> {
    const commit = packageJson.commit || '';
    const branch = packageJson.branch || '';

    return {
      locale: settingStore.getSetting<string>('locale'),
      appVersion: settingStore.getSetting<string>('appVersion'),
      versionName: settingStore.getSetting<string>('versionName'),
      copyright: packageJson.copyright,
      commit,
      branch,
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      isMac: settingStore.isMac(),
      isWindows: settingStore.isWindows()
    };
  }

  public render(): JSX.Element | null {
    const { appVersion, versionName, isWindows, showTooltip } = this.state;

    const version = this.getVersionString();
    const versionClassName = classNames('AboutBox-version', {
      long: appVersion !== undefined && appVersion.length > 10
    });
    const copiedText = $intl.t('Copied!', LOCALE_NAMESPACE.RENDERER)();
    const buttonClassName = classNames('AboutBox-acknowledgements');

    return (
      <div className={isWindows ? 'AboutBox titlebarAdjusted' : 'AboutBox'}>
        <img
          className='AboutBox-logo'
          draggable={false}
          srcSet='Hash.png 1x, Hash@2x.png 2x, Hash@3x.png 3x'
        />

        <span className='AboutBox-tooltipContainer'>
          <span className='AboutBox-tooltip' style={{ opacity: showTooltip ? 1 : 0 }}>
            {copiedText}
          </span>
        </span>

        <span className='AboutBox-versionContainer'>
          <span
            className={versionClassName}
            draggable={false}
            key='version'
            ref={this.refHandlers.version}
          >
            {version}
          </span>
          <span>
            <button
              className='AboutBox-copy ts_icon ts_icon_all_files'
              key='copy'
              title={$intl.t('Copy', LOCALE_NAMESPACE.RENDERER)()}
              onClick={this.eventHandlers.onCopyVersion}
            />
          </span>
        </span>

        <span className='AboutBox-versionName' draggable={false}>
          ({versionName})
        </span>

        <input
          type='button'
          className={buttonClassName}
          ref={this.refHandlers.acknowledgements}
          key='acknowledgements'
          value={$intl.t('Notices and Acknowledgements', LOCALE_NAMESPACE.RENDERER)()}
          onClick={this.eventHandlers.onShowDependencies}
        />
      </div>
    );
  }

  public componentDidMount(): void {
    const contextMenuBuilder = new ContextMenuBuilder();
    this.contextMenuListener = new ContextMenuListener((info: any) => contextMenuBuilder.showPopupMenu(info));
  }

  public componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.contextMenuListener) {
      this.contextMenuListener.unsubscribe();
      this.contextMenuListener = null;
    }
  }

  private copyVersion(): void {
    clipboard.writeText(this.getVersionString());
    this.setState({ showTooltip: true });
    setTimeout(() => this.setState({ showTooltip: false }), 3000);
  }

  private getVersionString(): string {
    const { appVersion, releaseChannel, isMac, isWindows, branch } = this.state;
    const commit = this.state.commit || '';

    let arch = process.arch === 'x64' ? ' 64-bit' : ' 32-bit';
    if (isMac) arch = '';

    const channelToFriendlyName = {
      alpha: $intl.t('Alpha Channel', LOCALE_NAMESPACE.RENDERER)(),
      beta: $intl.t('Beta Channel', LOCALE_NAMESPACE.RENDERER)(),
      prod: $intl.t('Direct Download', LOCALE_NAMESPACE.RENDERER)()
    };

    let friendlyVersion = appVersion || '';
    // If this is a prerelease version, show SHA and branch
    if (friendlyVersion.indexOf('-') > 0 && commit && branch) {
      friendlyVersion = friendlyVersion.replace(commit, '');
      friendlyVersion = `${friendlyVersion} ${branch}/${commit}`;
    }

    let friendlyName = channelToFriendlyName[releaseChannel!];
    if (IS_STORE_BUILD) {
      friendlyName = isWindows ?
        $intl.t('Windows Store', LOCALE_NAMESPACE.RENDERER)() :
        $intl.t('App Store', LOCALE_NAMESPACE.RENDERER)();
    }

    return `${friendlyVersion}${arch} ${friendlyName || ''}`;
  }

  private showDependencies(): void {
    const noticeURL = 'https://slack.com/libs/desktop';
    shell.openExternal(noticeURL);
  }
}
