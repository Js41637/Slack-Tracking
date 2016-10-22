import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import EventStore from '../../stores/event-store';
import Modal from '../../components/modal';
import SettingStore from '../../stores/setting-store';
import WebViewContext from './web-view-ctx';
import WindowHelpers from '../../components/helpers/window-helpers';

import {SIDEBAR_WIDTH_NO_TITLE_BAR} from '../../utils/shared-constants';

export default class LoginView extends Component {

  static defaultProps = {
    fadeInOnEnter: false,
    showAsOverlay: true,
    cancelable: false,
    onCancel: () => {}
  };

  static propTypes = {
    fadeInOnEnter: React.PropTypes.bool,
    showAsOverlay: React.PropTypes.bool,
    cancelable: React.PropTypes.bool,
    onCancel: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state.showBackButton = false;
    this.state.pageDidLoad = false;
    this.state.spinnerOpacity = 0;
  }

  syncState() {
    return {
      slackUrl: SettingStore.getSignInUrl(),
      isTitleBarHidden: SettingStore.getSetting('isTitleBarHidden'),
      isShowingDevTools: AppStore.isShowingDevTools(),
      focusPrimaryTeamEvent: EventStore.getEvent('focusPrimaryTeam')
    };
  }

  componentDidMount() {
    this.setState({spinnerOpacity: 1});
  }

  componentDidUpdate(prevProps, prevState) {
    WindowHelpers.updateDevTools(this.refs.webView, prevState, this.state);
  }

  focusPrimaryTeamEvent() {
    this.refs.webView.focus();
  }

  handlePageLoad = () => {
    this.setState({showBackButton: this.refs.webView.canGoBack(), pageDidLoad: true});
    this.refs.webView.focus();
  };

  handleBack = () => {
    this.refs.webView.goBack();
  };

  render() {
    let backButton = this.state.showBackButton ?
      <a className="LoginView-back" onClick={this.handleBack}><img src="./ts_icon_arrow_large_left.svg" /></a> : null;

    let cancelButton = this.props.cancelable ?
      <a className="LoginView-cancel" onClick={this.props.onCancel}><img src="./ts_icon_times_circle.svg" /></a> : null;

    let overlay = this.state.pageDidLoad ? null : (
      <div className="LoginView-overlay">
        <img className="LoginView-overlaySpinner" ref="spinner"
          srcSet="trying.webp 1x, trying@2x.webp 2x" style={{opacity: this.state.spinnerOpacity}}/>
      </div>
    );

    let sidebarOffset = this.state.isTitleBarHidden ?
      SIDEBAR_WIDTH_NO_TITLE_BAR : 0;

    let loginContent = (
      <div className="LoginView-dialog" style={{height: '100%'}}>
        <ReactCSSTransitionGroup transitionName="overlay"
          transitionEnter={false} transitionLeaveTimeout={300}>
          {overlay}
        </ReactCSSTransitionGroup>
        <WebViewContext
          options={{src: this.state.slackUrl}}
          onPageLoad={this.handlePageLoad}
          onRequestClose={this.props.onCancel}
          ref="webView"/>
      </div>
    );

    return this.props.showAsOverlay ? (
      <Modal className="LoginView"
        width={790} height={660}
        transitionAppear={this.props.fadeInOnEnter}>
        <div className="LoginView-buttons">
          {backButton}
          {cancelButton}
        </div>
        {loginContent}
      </Modal>
    ) : (
      <div className="LoginView" style={{left: sidebarOffset}}>
        <div className="LoginView-buttons">
          {backButton}
          {cancelButton}
        </div>
        {loginContent}
      </div>
    );
  }
}
