import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import EventStore from '../../stores/event-store';
import FullScreenModal from '../../components/full-screen-modal';
import SettingStore from '../../stores/setting-store';
import WebViewContext from './web-view-ctx';
import WindowHelpers from '../../components/helpers/window-helpers';

export default class LoginView extends Component {

  static defaultProps = {
    cancelable: false,
    onCancel: () => {}
  };

  static propTypes = {
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

  cancel() {
    this.refs.modal.cancel();
  }

  focusPrimaryTeamEvent() {
    this.refs.webView.focus();
  }

  handlePageLoad() {
    this.setState({pageDidLoad: true});
    this.refs.webView.focus();
  }

  render() {
    let overlay = this.state.pageDidLoad ? null : (
      <div className="LoginView-overlay">
        <img className="LoginView-overlaySpinner" ref="spinner"
          srcSet="trying.webp 1x, trying@2x.webp 2x"
          style={{opacity: this.state.spinnerOpacity}}/>
      </div>
    );

    return (
      <FullScreenModal ref="modal"
        showCancel={this.props.cancelable}
        onCancel={this.props.onCancel}>

        <div className="LoginView">
          <ReactCSSTransitionGroup transitionName="overlay"
            transitionEnter={false}
            transitionLeaveTimeout={300}>
            {overlay}
          </ReactCSSTransitionGroup>

          <WebViewContext className="webView"
            options={{src: this.state.slackUrl}}
            onPageLoad={() => this.handlePageLoad()}
            onRequestClose={() => this.cancel()}
            ref="webView"/>
        </div>
      </FullScreenModal>
    );
  }
}
