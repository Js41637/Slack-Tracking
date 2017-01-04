import * as Color from 'color';
import * as React from 'react'; // tslint:disable-line
import {WinWindowControls} from './win-titlebar-controls';
import {WinHamburger} from './win-titlebar-hamburger';
import Component from '../../lib/component';
import AppTeamsStore from '../../stores/app-teams-store';
import TeamStore from '../../stores/team-store';
import {getSidebarColor, getTextColor} from '../../utils/color';

export interface WinTitlebarProps {
  defaultTitle?: string;
  height?: number;
  controlsColor?: string;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
}

export interface WinTitlebarState {
  selectedTeamId?: string;
  selectedTeam?: any;
}

export class WinTitlebar extends Component<WinTitlebarProps, WinTitlebarState> {
  public static readonly defaultProps: WinTitlebarProps = {
    height: 31,
    defaultBackgroundColor: '#232323',
    defaultTextColor: '#fff',
    defaultTitle: 'Slack'
  };

  public syncState(): WinTitlebarState {
    const selectedTeamId = AppTeamsStore.getSelectedTeamId();

    return {
      selectedTeamId,
      selectedTeam: selectedTeamId && TeamStore.getTeam(selectedTeamId)
    };
  }

  public render(): JSX.Element | null {
    const { defaultTitle, defaultBackgroundColor, defaultTextColor } = this.props;
    let backgroundColor = defaultBackgroundColor;
    let textColor = defaultTextColor;
    let title = defaultTitle;

    if (this.state.selectedTeam) {
      const sidebarColor = getSidebarColor(this.state.selectedTeam);
      backgroundColor = Color(sidebarColor).darken(0.15).rgbaString();
      textColor = getTextColor(this.state.selectedTeam);
      title = `Slack - ${this.state.selectedTeam.team_name}`;
    }

    const style = { backgroundColor, color: textColor };

    return (
      <div className='Windows-Titlebar' style={style}>
        <WinHamburger fillColor={textColor} />
        <div className='Windows-Titlebar-title'>
          {title}
        </div>
        <div className='Windows-Titlebar-spacer' />
        <WinWindowControls fillColor={textColor} />
      </div>
    );
  }
}
