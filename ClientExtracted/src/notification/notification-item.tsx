/**
 * @module Notifications
 */ /** for typedoc */

import * as Color from 'color';
import { logger } from '../logger';
import { Observable } from 'rxjs/Observable';

import { Component } from '../lib/component';
import { notificationActions, Notification } from '../actions/notification-actions';
import { TeamIcon } from '../renderer/components/team-icon';
import { teamStore } from '../stores/team-store';
import { TeamBase } from '../actions/team-actions';

import * as React from 'react'; // tslint:disable-line

// Save the Aubergine theme in case we run into trouble.
const defaultTheme = {
  active_item: '#4C9689',
  active_item_text: '#FFFFFF',
  active_presence: '#38978D',
  badge: '#EB4D5C',
  column_bg: '#4D394B',
  hover_item: '#3E313C',
  menu_bg: '#3E313C',
  text_color: '#FFFFFF'
};

const ICON_SIZE = 72;

export interface NotificationItemProps {
  timeout?: number;
  afterHoverTimeout?: number;
  notification: Notification;
}

export interface NotificationItemState {
  team: TeamBase;
}

export class NotificationItem extends Component<NotificationItemProps, NotificationItemState> {
  public static defaultProps: Partial<NotificationItemProps> = {
    timeout: 6000,
    afterHoverTimeout: 2000
  };

  private mainElement: HTMLElement;
  private closeButtonElement: HTMLElement;
  private readonly refHandlers = {
    main: (ref: HTMLElement) => this.mainElement = ref,
    closeButton: (ref: HTMLElement) => this.closeButtonElement = ref
  };

  private readonly eventHandlers = {
    close: () => this.remove()
  };

  constructor(props: Partial<NotificationItemProps>) {
    super(props);
  }

  public syncState(): Partial<NotificationItemState> {
    const state = {
      team: teamStore.getTeam(this.props.notification.teamId)
    };

    if (!state.team) {
      logger.warn(`NotificationItem: No team in notification ${this.props.notification.id}!`);
      logger.warn(`NotificationItem: Requested teamId was: ${this.props.notification.teamId}`);
      logger.warn(`NotificationItem: Available teams: ${teamStore.getTeamIds()}`);
    }

    return state;
  }

  public componentDidMount(): void {
    const mouseLeave = Observable.fromEvent(this.mainElement, 'mouseleave');
    const mouseOver = Observable.fromEvent(this.mainElement, 'mouseover');
    const mouseClick = Observable.fromEvent(this.mainElement, 'click');

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

    this.disposables.add(mouseClick.subscribe((e: Event) => this.select(e)));
  }

  public render(): JSX.Element | null {
    const notification = this.props.notification;
    const theme = this.state.team ? (this.state.team.theme || defaultTheme) : defaultTheme;

    const contentBackground = Color((theme as any).column_bg);
    const headerBackground = Color((theme as any).menu_bg);
    const isDarkColor = contentBackground.dark();

    // Set the text color and hash image for maximum contrast with the background.
    const textColor = isDarkColor ? '#ffffff' : '#000000';
    const hashColor = isDarkColor ? 'white' : 'black';
    const initialsColor = Color(textColor).alpha(0.7).rgbaString();
    const hashSrcSet = `logo_${hashColor}@2x.png 1x,logo_${hashColor}@2x.png 2x,logo_${hashColor}@3x.png 3x`;

    // TODO: Create a parser to extract image tags from text to avoid innerHTML dangers
    return (
      <div className='NotificationItem' ref={this.refHandlers.main}>
        <div
          className='NotificationItem-content'
          style={{ backgroundColor: contentBackground.hexString(), borderColor: contentBackground.lighten(0.33).hexString() }}
        >
          <div className='NotificationItem-icon' style={{ backgroundColor: headerBackground.hexString() }}>
            <TeamIcon size={ICON_SIZE} team={this.state.team} color={initialsColor} borderRadius={0} />
          </div>
          <div className='NotificationItem-text' style={{ color: textColor }}>
            <p className='NotificationItem-title'>{notification.title}</p>
            <p className='NotificationItem-message' dangerouslySetInnerHTML={{ __html: notification.content }}/>
          </div>
          <img className='NotificationItem-hash' srcSet={hashSrcSet}/>
          <a
            className='NotificationItem-close'
            style={{ color: textColor }}
            ref={this.refHandlers.closeButton}
            onClick={this.eventHandlers.close}
          >
            &times;
          </a>
        </div>
      </div>
    );
  }

  private remove(): void {
    notificationActions.removeNotification(this.props.notification.id);
  }

  private select(e: Event): void {
    // stopPropagation wasn't working so check the target
    if (e.target !== this.closeButtonElement) {
      const { id, channel, teamId, msg, thread_ts } = this.props.notification;
      notificationActions.clickNotification(id, channel, teamId, msg, thread_ts);
    }
  }
}
