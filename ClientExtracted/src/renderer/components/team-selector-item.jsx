import classNames from 'classnames';
import React from 'react';
import {getTextColor, getSidebarColor} from '../../utils/color';

import {appTeamsActions} from '../../actions/app-teams-actions';
import {teamActions} from '../../actions/team-actions';
import Component from '../../lib/component';
import {TeamIcon} from '../../components/team-icon';
import {getContainsInvalid} from '../../utils/utf-safety';

const isDarwin = process.platform === 'darwin';

export default class TeamSelectorItem extends Component {
  constructor(props) {
    super(props);
    this.ensureValidInitials();
  }

  static defaultProps = {
    iconSize: 36,
    selectorLeftOffset: -14
  };

  static propTypes = {
    team: React.PropTypes.object.isRequired,
    selectedTeam: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired,
    iconSize: React.PropTypes.number,
    selectorLeftOffset: React.PropTypes.number,
    borderRadius: React.PropTypes.number
  };

  handleClick() {
    appTeamsActions.selectTeam(this.props.team.team_id);
  }

  computeShortcutText(index) {
    let shortcut = null;
    if (index < 9) {
      if (isDarwin) {
        shortcut = `⌘${index + 1}`;
      } else {
        shortcut = `Ctrl+${index + 1}`;
      }
    }

    return shortcut;
  }

  /**
   * If a team was added before Slack 2.3, our initials might
   * be incorrect (if they use any non-ASCII characters, like
   * emojii or other composite chars found in many non-latin
   * languages).
   *
   * We can probably remove this method in one or two releases
   * after 2.4.
   */
  ensureValidInitials() {
    const t = this.props.team;

    if (t && t.initials && t.id && t.team_name && getContainsInvalid(t.initials)) {
      teamActions.updateTeamName(t.team_name, t.id);
    }
  }

  render() {
    let {team, selectedTeam, index, selectorLeftOffset, iconSize} = this.props;
    let selected = team === selectedTeam;
    let hasUnread = team.unreads + team.unreadHighlights > 0;
    let shouldHighlight = team.unreadHighlights > 0;
    if (isDarwin) shouldHighlight &= !selected;
    let highlightStroke = getSidebarColor(selectedTeam);

    let status = {
      'selected': selected,
      'unreads': hasUnread && !selected,
      'highlight': shouldHighlight
    };

    let unreadHighlights;
    if (team.unreadHighlights > 99) {
      unreadHighlights = '+';
    } else if (team.unreadHighlights === 0) {
      // NB: In this state, we're about to hide the badge, but it will flash
      // briefly to '0' first. Keep it at '1' to avoid that.
      unreadHighlights = 1;
    } else {
      unreadHighlights = team.unreadHighlights;
    }

    let textColor = getTextColor(selectedTeam);
    let shortcut = this.computeShortcutText(index);

    let fontSize = isDarwin ? '12px' : '11px';

    return (
      <div className={classNames("TeamSelectorItem", status)} style={{color: textColor}}>
        <div className="TeamSelectorItem-indicator" style={{
          left: selectorLeftOffset,
          background: textColor
        }}/>
        <span className="TeamSelectorItem-unreadHighlights" style={{border: `2px solid ${highlightStroke}`}}>
          {unreadHighlights}
        </span>
        <div className="TeamSelectorItem-item" onClick={this.handleClick.bind(this)}>
          <TeamIcon
            team={this.props.team}
            size={iconSize}
            color={textColor}
            darkened={!selected}
            borderRadius={this.props.borderRadius}
          />
          <span className="TeamSelectorItem-shortcut"
            style={{
              fontSize: fontSize,
              opacity: selected ? 0.4 : 0.32
            }}>
            {shortcut}
          </span>
        </div>
      </div>
    );
  }
}
