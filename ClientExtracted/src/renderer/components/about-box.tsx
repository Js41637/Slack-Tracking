/**
 * @module RendererComponents
 */ /** for typedoc */

import { ContextMenuListener } from '../../context-menu-listener';
import { ContextMenuBuilder } from '../../context-menu';
import * as classNames from 'classnames';
import * as ReactDOM from 'react-dom';
import * as packageJson from '../../../package.json';
import { clipboard, remote } from 'electron';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { DependenciesView } from './dependencies-view';
import { settingStore } from '../../stores/setting-store';

import * as React from 'react';

import { IS_STORE_BUILD } from '../../utils/shared-constants';

const ABOUT_BOX_WIDTH = 320;
const ABOUT_BOX_EXPANDED_HEIGHT = 428;
const DEPENDENCIES_HEIGHT = 192;
const SCROLLBAR_WIDTH = 16;
const TITLEBAR_HEIGHT = 24;

export interface AboutBoxProps {
}

export interface AboutBoxState {
  appVersion: string;
  versionName: string;
  copyright: string;
  commit: string;
  branch: string;
  releaseChannel: string;
  isMac: boolean;
  isWindows: boolean;
  buttonState: any;
  dependenciesState: any;
  showTooltip: boolean;
}

export class AboutBox extends Component<AboutBoxProps, Partial<AboutBoxState>> {
  private contextMenuListener: ContextMenuListener | null;
  private acknowledgementsElement: HTMLElement;
  private versionElement: HTMLElement;
  private readonly refHandlers = {
    acknowledgements: (ref: HTMLElement) => this.acknowledgementsElement = ref,
    version: (ref: HTMLElement) => this.versionElement = ref,
  };

  public syncState(): Partial<AboutBoxState> {
    return {
      appVersion: settingStore.getSetting<string>('appVersion'),
      versionName: settingStore.getSetting<string>('versionName'),
      copyright: packageJson.copyright,
      commit: packageJson.commit,
      branch: packageJson.branch,
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      isMac: settingStore.isMac(),
      isWindows: settingStore.isWindows()
    };
  }

  public render(): JSX.Element | null {
    const { appVersion, versionName, isMac, isWindows,
      buttonState, showTooltip, dependenciesState } = this.state;

    const version = this.getVersionString();
    const versionClassName = classNames('AboutBox-version', {
      long: appVersion !== undefined && appVersion.length > 10
    });
    const copiedText = $intl.t('Copied!', LOCALE_NAMESPACE.RENDERER)();
    const buttonClassName = classNames('AboutBox-acknowledgements', buttonState);
    const dependenciesClassName = classNames('AboutBox-dependencies', dependenciesState);
    const dependenciesWidth = isMac ? ABOUT_BOX_WIDTH : ABOUT_BOX_WIDTH - SCROLLBAR_WIDTH;

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
              title={$intl.t(`Copy`, LOCALE_NAMESPACE.RENDERER)()}
              onClick={this.copyVersion.bind(this)}
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
          value={$intl.t(`Acknowledgements`, LOCALE_NAMESPACE.RENDERER)()}
          onClick={this.showDependencies.bind(this)}
        />

        <DependenciesView
          className={dependenciesClassName}
          width={dependenciesWidth}
          height={DEPENDENCIES_HEIGHT}
          style={{ width: dependenciesWidth }}
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
    const { appVersion, releaseChannel, isMac, isWindows, commit, branch } = this.state;

    let arch = process.arch === 'x64' ? ' 64-bit' : ' 32-bit';
    if (isMac) arch = '';

    const channelToFriendlyName = {
      alpha: $intl.t(`Alpha Channel`, LOCALE_NAMESPACE.RENDERER)(),
      beta: $intl.t(`Beta Channel`, LOCALE_NAMESPACE.RENDERER)(),
      prod: $intl.t(`Direct Download`, LOCALE_NAMESPACE.RENDERER)()
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
        $intl.t(`Windows Store`, LOCALE_NAMESPACE.RENDERER)() :
        $intl.t(`App Store`, LOCALE_NAMESPACE.RENDERER)();
    }

    return `${friendlyVersion}${arch} ${friendlyName || ''}`;
  }

  private showDependencies(): void {
    const aboutBox = remote.getCurrentWindow();
    const expandedHeight = this.state.isMac ?
      ABOUT_BOX_EXPANDED_HEIGHT :
      ABOUT_BOX_EXPANDED_HEIGHT + TITLEBAR_HEIGHT;

    aboutBox.setSize(ABOUT_BOX_WIDTH, expandedHeight, true);
    this.setState({ buttonState: 'fadeOut' });

    // Wait for the button to fade out before animating the other elements.
    const button = ReactDOM.findDOMNode(this.acknowledgementsElement);
    button.addEventListener('transitionend', () => {
      this.setState({ dependenciesState: 'fadeIn' });
    });
  }
}
