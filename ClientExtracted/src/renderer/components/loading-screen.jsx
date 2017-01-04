import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {shell} from 'electron';

import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import {eventActions} from '../../actions/event-actions';

export default class LoadingScreen extends Component {

  static defaultProps = {
    className: 'Startup'
  };

  static propTypes = {
    className: React.PropTypes.string,
    networkOverride: React.PropTypes.string
  };

  syncState() {
    return { networkStatus: AppStore.getNetworkStatus() };
  }

  retryConnection() {
    eventActions.reload(true);
  }

  openStatusPage() {
    shell.openExternal('http://status.slack.com');
  }

  render() {
    let offline = (
      <div className="LoadingScreen-noService">
        <img width="362" height="102" src="./offline.webp"/>
        <span className="LoadingScreen-text">
          {"It appears you don't have an internet connection right now."}<br/>
          <span style={{color: "#4c9689"}}>Slack will attempt to automatically reconnect.</span>
            <br/><br/>
            <center>
              <a className="LoadingScreen-button" onClick={this.retryConnection}>Try now</a>
            </center>
        </span>
      </div>
    );

    let slackDown = (
      <div className="LoadingScreen-offline">
        <img width="284" height="284" src="./slackdown.webp"/><br/>
        <span className="LoadingScreen-text">
          The Slack service appears to be unavailable.
          Please check <a href="http://status.slack.com" onClick={this.openStatusPage}>status.slack.com</a>.
          <br/><br/>
          <center>
            <a className="LoadingScreen-button" onClick={this.retryConnection}>Try now</a>
          </center>
        </span>
      </div>
    );

    let trying = (
      <div className="LoadingScreen-connecting">
        <img width="90" height="90" srcSet="trying.webp 1x, trying@2x.webp 2x" />
        <span className="LoadingScreen-text">Connecting ...</span>
      </div>
    );

    let {networkStatus} = this.state;
    if (this.props.networkOverride) {
      networkStatus = this.props.networkOverride;
    }

    let content = trying;
    if (networkStatus === 'offline') {
      content = offline;
    } else if (networkStatus === 'slackDown') {
      content = slackDown;
    }

    // A component can control the animation as it mounts, but not as it unmounts
    return (
      <ReactCSSTransitionGroup component="div" className={`LoadingScreen ${this.props.className}`}
        transitionName="anim" transitionEnter={false} transitionLeave={false}
        transitionAppear={true} transitionAppearTimeout={500}>
        {content}
      </ReactCSSTransitionGroup>
    );
  }
}
