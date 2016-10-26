import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import packageJson from '../../../package.json';
import {remote} from 'electron';

import Component from '../../lib/component';
import DependenciesView from './dependencies-view';
import SettingStore from '../../stores/setting-store';

const ABOUT_BOX_WIDTH = 320;
const ABOUT_BOX_EXPANDED_HEIGHT = 428;
const DEPENDENCIES_HEIGHT = 192;
const SCROLLBAR_WIDTH = 16;
const TITLEBAR_HEIGHT = 24;

export default class AboutBox extends Component {

  syncState() {
    return {
      appVersion: SettingStore.getSetting('appVersion'),
      versionName: SettingStore.getSetting('versionName'),
      copyright: packageJson.copyright,
      releaseChannel: SettingStore.getSetting('releaseChannel'),
      isWindowsStore: SettingStore.getSetting('isWindowsStore'),
      isMac: SettingStore.isMac(),
      isWindows: SettingStore.isWindows()
    };
  }

  showDependencies() {
    let aboutBox = remote.getCurrentWindow();
    let expandedHeight = this.state.isMac ?
      ABOUT_BOX_EXPANDED_HEIGHT :
      ABOUT_BOX_EXPANDED_HEIGHT + TITLEBAR_HEIGHT;

    aboutBox.setSize(ABOUT_BOX_WIDTH, expandedHeight, true);
    this.setState({buttonState: 'fadeOut'});

    // Wait for the button to fade out before animating the other elements.
    let button = ReactDOM.findDOMNode(this.refs.acknowledgements);
    button.addEventListener('transitionend', () => {
      this.setState({dependenciesState: 'fadeIn'});
    });
  }

  render() {
    let {appVersion, versionName, releaseChannel, isMac, isWindows, isWindowsStore, buttonState, dependenciesState} = this.state;

    let arch = process.arch === 'x64' ? ' 64-bit' : ' 32-bit';
    if (isMac) arch = '';

    const channelToFriendlyName = {
      mas: 'App Store',
      beta: 'Beta Channel',
      prod: 'Direct Download'
    };

    let friendlyName = channelToFriendlyName[releaseChannel];
    if (isWindowsStore) {
      friendlyName = 'Windows Store';
    }

    let version = `${appVersion}${arch} ${friendlyName || ''}`;
    let buttonClassName = classNames('AboutBox-acknowledgements', buttonState);
    let dependenciesClassName = classNames('AboutBox-dependencies', dependenciesState);
    let dependenciesWidth = isMac ? ABOUT_BOX_WIDTH : ABOUT_BOX_WIDTH - SCROLLBAR_WIDTH;

    return (
      <div className={isWindows ? "AboutBox titlebarAdjusted" : "AboutBox"}>
        <img className="AboutBox-logo" draggable="false"
          srcSet="Hash.png 1x, Hash@2x.png 2x, Hash@3x.png 3x" />
        <span className="AboutBox-version" draggable="false">
          {version}
        </span>
        <span className="AboutBox-versionName" draggable="false">
          ({versionName})
        </span>

        <input
          type="button"
          className={buttonClassName}
          ref="acknowledgements"
          key="acknowledgements"
          value="Acknowledgements"
          onClick={this.showDependencies.bind(this)} />

        <DependenciesView
          className={dependenciesClassName}
          width={dependenciesWidth}
          height={DEPENDENCIES_HEIGHT}
          style={{width: dependenciesWidth}}/>
      </div>
    );
  }
}