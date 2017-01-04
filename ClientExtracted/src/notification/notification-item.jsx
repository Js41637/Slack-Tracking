import Color from 'color';
import {logger} from '../logger';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import React from 'react';

import Component from '../lib/component';
import NotificationActions from '../actions/notification-actions';
import {TeamIcon} from '../components/team-icon';
import TeamStore from '../stores/team-store';

// Save the Aubergine theme in case we run into trouble.
const defaultTheme = {
  active_item: "#4C9689",
  active_item_text: "#FFFFFF",
  active_presence: "#38978D",
  badge: "#EB4D5C",
  column_bg: "#4D394B",
  hover_item: "#3E313C",
  menu_bg: "#3E313C",
  text_color: "#FFFFFF"
};

const ICON_SIZE = 72;

export default class NotificationItem extends Component {

  static defaultProps = {
    timeout: 6000,
    afterHoverTimeout: 2000
  };

  static propTypes = {
    notification: React.PropTypes.shape({
      id: React.PropTypes.string,
      title: React.PropTypes.string,
      content: React.PropTypes.string,
      teamId: React.PropTypes.string,
      msg: React.PropTypes.string
    }).isRequired,
    timeout: React.PropTypes.number,
    afterHoverTimeout: React.PropTypes.number
  };

  constructor(props) {
    super(props);
    this.disp = new Subscription();
  }

  syncState() {
    let state = {
      team: TeamStore.getTeam(this.props.notification.teamId)
    };

    if (!state.team) {
      logger.warn(`No team in notification ${this.props.notification.id}!`);
      logger.warn(`Requested teamId was: ${this.props.notification.teamId}`);
      logger.warn(`Available teams: ${TeamStore.getTeamIds()}`);
    }

    return state;
  }

  componentDidMount() {
    let mouseLeave = Observable.fromEvent(this.refs.main, 'mouseleave');
    let mouseOver = Observable.fromEvent(this.refs.main, 'mouseover');
    let mouseClick = Observable.fromEvent(this.refs.main, 'click');

    // Remove the notification if either the timeout is reached without
    // the user mousing over it, or the user's mouse leaves the notification
    // and a shorter timeout is reached without another mouseover
    this.disposables.add(Observable.merge(
      Observable.timer(this.props.timeout).takeUntil(mouseOver),
      mouseLeave.flatMap(() =>
        Observable.timer(this.props.afterHoverTimeout).takeUntil(mouseOver))
      )
      .take(1)
      .subscribe(() => this.remove()));

    this.disposables.add(mouseClick.subscribe((e) => this.select(e)));
  }

  remove() {
    NotificationActions.removeNotification(this.props.notification.id);
  }

  select(e) {
    // stopPropagation wasn't working so check the target
    if (e.target != this.refs.closeButton) {
      let {id, channel, teamId, msg} = this.props.notification;
      NotificationActions.clickNotification(id, channel, teamId, msg);
    }
  }

  render() {
    let notification = this.props.notification;
    let theme = this.state.team ? (this.state.team.theme || defaultTheme) : defaultTheme;

    let contentBackground = Color(theme.column_bg);
    let headerBackground = Color(theme.menu_bg);
    let isDarkColor = contentBackground.dark();

    // Set the text color and hash image for maximum contrast with the background.
    let textColor = isDarkColor ? '#ffffff' : '#000000';
    let hashColor = isDarkColor ? 'white' : 'black';
    let initialsColor = Color(textColor).alpha(0.7).rgbaString();
    let hashSrcSet = `logo_${hashColor}@2x.png 1x,logo_${hashColor}@2x.png 2x,logo_${hashColor}@3x.png 3x`;

    // TODO: Create a parser to extract image tags from text to avoid innerHTML dangers
    return (
      <div className="NotificationItem" ref="main">
        <div
          className="NotificationItem-content"
          style={{
            backgroundColor: contentBackground.hexString(),
            borderColor: contentBackground.lighten(0.33).hexString()
          }}>
          <div className="NotificationItem-icon" style={{backgroundColor: headerBackground.hexString()}}>
            <TeamIcon size={ICON_SIZE} team={this.state.team} color={initialsColor} borderRadius={0} />
          </div>
          <div className="NotificationItem-text" style={{color: textColor}}>
            <p className="NotificationItem-title">{notification.title}</p>
            <p className="NotificationItem-message" dangerouslySetInnerHTML={{__html: notification.content}}></p>
          </div>
          <img className="NotificationItem-hash" srcSet={hashSrcSet}/>
          <a
            className="NotificationItem-close"
            style={{color: textColor}}
            ref="closeButton"
            onClick={() => this.remove()}>
            &times;
          </a>
        </div>
      </div>
    );
  }
}
