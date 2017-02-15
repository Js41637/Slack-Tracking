import {getContextMenuBuilder} from '../../context-menu';
import * as classNames from 'classnames';
import * as ReactDOM from 'react-dom';
import * as packageJson from '../../../package.json';
import {remote} from 'electron';
import {ContextMenuListener} from 'electron-spellchecker';

import {intl as $intl, LOCALE_NAMESPACE} from '../../i18n/intl';
import {Component} from '../../lib/component';
import {DependenciesView} from './dependencies-view';
import {settingStore} from '../../stores/setting-store';

import * as React from 'react'; // tslint:disable-line

import {IS_STORE_BUILD} from '../../utils/shared-constants';

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
  releaseChannel: string;
  isMac: boolean;
  isWindows: boolean;
  buttonState: any;
  dependenciesState: any;
}

export class AboutBox extends Component<AboutBoxProps, Partial<AboutBoxState>> {
  private contextMenuListener: any;
  private acknowledgementsElement: HTMLElement;
  private readonly refHandlers = {
    acknowledgements: (ref: HTMLElement) => this.acknowledgementsElement = ref
  };

  public syncState(): Partial<AboutBoxState> {
    return {
      appVersion: settingStore.getSetting<string>('appVersion'),
      versionName: settingStore.getSetting<string>('versionName'),
      copyright: packageJson.copyright,
      releaseChannel: settingStore.getSetting<string>('releaseChannel'),
      isMac: settingStore.isMac(),
      isWindows: settingStore.isWindows()
    };
  }

  public render(): JSX.Element | null {
    const {appVersion, versionName, releaseChannel, isMac, isWindows,
      buttonState, dependenciesState} = this.state;

    let arch = process.arch === 'x64' ? ' 64-bit' : ' 32-bit';
    if (isMac) arch = '';

    const channelToFriendlyName = {
      beta: $intl.t(`Beta Channel`, LOCALE_NAMESPACE.RENDERER)(),
      prod: $intl.t(`Direct Download`, LOCALE_NAMESPACE.RENDERER)()
    };

    let friendlyName = channelToFriendlyName[releaseChannel!];
    if (IS_STORE_BUILD) {
      friendlyName = isWindows ? 'Windows Store' : 'App Store';
    }

    const version = `${appVersion}${arch} ${friendlyName || ''}`;
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
        <span className='AboutBox-version' draggable={false}>
          {version}
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
          style={{width: dependenciesWidth}}
        />
      </div>
    );
  }

  public componentDidMount(): void {
    const contextMenuBuilder = getContextMenuBuilder();
    this.contextMenuListener = new ContextMenuListener((info: any) => contextMenuBuilder.showPopupMenu(info));
  }

  public componentWillUnmount(): void {
    if (this.contextMenuListener) {
      this.contextMenuListener.dispose();
      this.contextMenuListener = null;
    }
  }

  private showDependencies(): void {
    const aboutBox = remote.getCurrentWindow();
    const expandedHeight = this.state.isMac ?
      ABOUT_BOX_EXPANDED_HEIGHT :
      ABOUT_BOX_EXPANDED_HEIGHT + TITLEBAR_HEIGHT;

    aboutBox.setSize(ABOUT_BOX_WIDTH, expandedHeight, true);
    this.setState({buttonState: 'fadeOut'});

    // Wait for the button to fade out before animating the other elements.
    const button = ReactDOM.findDOMNode(this.acknowledgementsElement);
    button.addEventListener('transitionend', () => {
      this.setState({dependenciesState: 'fadeIn'});
    });
  }
}
