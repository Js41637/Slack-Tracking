import * as classNames from 'classnames';
import * as React from 'react'; // tslint:disable-line:no-unused-variable

import {Component} from '../../lib/component';
import {getContainsInvalid} from '../../utils/utf-safety';
import {getTextColor, getSidebarColor} from '../../utils/color';
import {intl as $intl, LOCALE_NAMESPACE} from '../../i18n/intl';
import {Team, teamActions} from '../../actions/team-actions';
import {TeamIcon} from './team-icon';

const isDarwin = process.platform === 'darwin';

export interface TeamSidebarItemProps {
  team: Team;
  selectedTeam: Team;
  index: number;
  iconSize: number;
  boxShadow: string;
  borderRadius: number;
}

export interface TeamSidebarItemState {
}

export class TeamSidebarItem extends Component<TeamSidebarItemProps, TeamSidebarItemState> {
  public static readonly defaultProps = {
    iconSize: 36
  };

  constructor(props: TeamSidebarItemProps) {
    super(props);
    this.ensureValidInitials();
  }

  public render(): JSX.Element | null {
    const {team, selectedTeam, index, iconSize, boxShadow, borderRadius} = this.props;
    const selected = team === selectedTeam;
    const hasUnread = team.unreads + team.unreadHighlights > 0;
    let shouldHighlight: any = team.unreadHighlights > 0;
    if (isDarwin) shouldHighlight &= (!selected as any);
    const highlightStroke = getSidebarColor(selectedTeam);

    const status = {
      selected,
      unreads: hasUnread && !selected,
      highlight: shouldHighlight
    };

    let unreadHighlights: string | number;
    if (team.unreadHighlights > 99) {
      unreadHighlights = '+';
    } else if (team.unreadHighlights === 0) {
      // NB: In this state, we're about to hide the badge, but it will flash
      // briefly to '0' first. Keep it at '1' to avoid that.
      unreadHighlights = 1;
    } else {
      unreadHighlights = team.unreadHighlights;
    }

    const textColor = getTextColor(selectedTeam);
    const shortcut = this.computeShortcutText(index);

    const fontSize = isDarwin ? '12px' : '11px';

    return (
      <div className={classNames('TeamSidebarItem', status)} style={{color: textColor}}>
        <div
          className='TeamSidebarItem-indicator'
          style={{background: textColor}}
        />
        <span className='TeamSidebarItem-unreadHighlights' style={{border: `2px solid ${highlightStroke}`}}>
          {unreadHighlights}
        </span>
        <div className='TeamSidebarItem-item'>
          <span
            className='TeamSidebarItem-hoverRect'
            style={{borderRadius}}
          />
          <TeamIcon
            team={this.props.team}
            size={iconSize}
            color={textColor}
            darkened={!selected}
            boxShadow={boxShadow}
            borderRadius={borderRadius}
          />
          <span
            className='TeamSidebarItem-shortcut'
            style={{fontSize, opacity: selected ? 0.4 : 0.32}}
          >
            {shortcut}
          </span>
        </div>
      </div>
    );
  }

  private computeShortcutText(index: number): string | null {
    let shortcut: string | null = null;
    if (index < 9) {
      shortcut = $intl.t(`{modifier}{idx}`, LOCALE_NAMESPACE.RENDERER)({
          modifier: isDarwin ? `⌘` : $intl.t(`Ctrl+`, LOCALE_NAMESPACE.GENERAL)(),
          idx: index + 1
        }
      );
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
  private ensureValidInitials(): void {
    const t = this.props.team;

    if (t && t.initials && t.id && t.team_name && getContainsInvalid(t.initials)) {
      teamActions.updateTeamName(t.team_name, t.id);
    }
  }
}
