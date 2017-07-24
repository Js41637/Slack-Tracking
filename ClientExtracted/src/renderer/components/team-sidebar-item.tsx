/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import * as React from 'react'; // tslint:disable-line:no-unused-variable

import { Team, teamActions } from '../../actions/team-actions';
import { UnreadsInfo } from '../../actions/unreads-actions';
import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { Component } from '../../lib/component';
import { getSidebarColor, getTextColor } from '../../utils/color';
import { getContainsInvalid } from '../../utils/utf-safety';
import { TeamIcon } from './team-icon';

const isDarwin = process.platform === 'darwin';

const defaultConstants = {
  right: -11,
  fontSize: 11.5,
  padHorizontal: 6,
  padVertical: 2
};

export interface TeamSidebarItemProps {
  team: Team;
  selectedTeam: Team;
  unreadsInfo?: UnreadsInfo;
  index: number;
  iconSize: number;
  boxShadow: string;
  borderRadius: number;
}

export class TeamSidebarItem extends Component<TeamSidebarItemProps> {
  public static readonly defaultProps = {
    iconSize: 36
  };

  constructor(props: TeamSidebarItemProps) {
    super(props);
    this.ensureValidInitials();
  }

  public render(): JSX.Element | null {
    const { team, selectedTeam, unreadsInfo, index, iconSize, boxShadow, borderRadius } = this.props;
    const selected = team === selectedTeam;

    const { unreads = 0, unreadHighlights = 0 } = unreadsInfo || {};
    const hasUnread = (unreads + unreadHighlights) > 0;

    let shouldHighlight = unreadHighlights > 0;
    if (isDarwin) shouldHighlight = shouldHighlight && !selected;

    const highlightsStyle = this.getMentionBadgeStyle(unreadHighlights, selectedTeam);

    const status = {
      selected,
      unreads: hasUnread && !selected,
      highlight: shouldHighlight
    };

    let highlightsBadge: string;
    if (unreadHighlights > 99) {
      highlightsBadge = '99+';
    } else if (unreadHighlights === 0) {
      // NB: In this state, we're about to hide the badge, but it will flash
      // briefly to '0' first. Keep it at '1' to avoid that.
      highlightsBadge = '1';
    } else {
      highlightsBadge = unreadHighlights.toString();
    }

    const textColor = getTextColor(selectedTeam);
    const shortcut = this.computeShortcutText(index);
    const fontSize = isDarwin ? '12px' : '11px';

    return (
      <div className={classNames('TeamSidebarItem', status)} style={{ color: textColor }}>
        <div
          className='TeamSidebarItem-indicator'
          style={{ background: textColor }}
        />
        <span className='TeamSidebarItem-unreadHighlights' style={highlightsStyle}>
          {highlightsBadge}
        </span>
        <div className='TeamSidebarItem-item'>
          <span
            className='TeamSidebarItem-hoverRect'
            style={{ borderRadius }}
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
            style={{ fontSize, opacity: selected ? 0.4 : 0.32 }}
          >
            {shortcut}
          </span>
        </div>
      </div>
    );
  }

  /**
   * Create a style for the mentions badge that takes the number of digits in
   * the badge into account (e.g., shrinks the font size or nudges it a bit so
   * that it doesn't overlap the sidebar).
   */
  private getMentionBadgeStyle(mentions: number, selectedTeam: Team): React.CSSProperties {
    const extraDigits = Math.min(Math.floor(Math.log10(mentions)), 3);

    const right = defaultConstants.right - extraDigits;
    const fontSize = defaultConstants.fontSize - (extraDigits * 0.5);
    const padHorizontal = defaultConstants.padHorizontal - extraDigits;
    const padVertical = defaultConstants.padVertical + extraDigits;
    const highlightStroke = getSidebarColor(selectedTeam);

    return {
      right: `${right}px`,
      fontSize: `${fontSize}px`,
      padding: `${padVertical}px ${padHorizontal}px`,
      border: `2px solid ${highlightStroke}`
    };
  }

  private computeShortcutText(index: number): string | null {
    let shortcut: string | null = null;
    if (index < 9) {
      shortcut = isDarwin ?
        $intl.t('⌘{idx}', LOCALE_NAMESPACE.RENDERER)({ idx: index + 1 }) :
        $intl.t('Ctrl+{idx}', LOCALE_NAMESPACE.RENDERER)({ idx: index + 1 });
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
