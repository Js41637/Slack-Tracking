/**
 * @module RendererComponents
 */ /** for typedoc */

import * as Color from 'color';
import { TeamBase } from '../../actions/team-actions';
import { Component } from '../../lib/component';
import { appTeamsStore } from '../../stores/app-teams-store';
import { teamStore } from '../../stores/team-store';
import { getSidebarColor, getTextColor } from '../../utils/color';
import { RazerChroma } from './razer-chroma';
import { WinWindowControls } from './win-titlebar-controls';
import { WinHamburger } from './win-titlebar-hamburger';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface WinTitlebarProps {
  defaultTitle?: string;
  height?: number;
  controlsColor?: string;
  defaultBackgroundColor?: string;
  defaultTextColor?: string;
}

export interface WinTitlebarState {
  selectedTeamId: string | null;
  selectedTeam: TeamBase | null;
}

export class WinTitlebar extends Component<WinTitlebarProps, WinTitlebarState> {
  public static readonly defaultProps: WinTitlebarProps = {
    height: 31,
    defaultBackgroundColor: '#232323',
    defaultTextColor: '#fff',
    defaultTitle: 'Slack'
  };

  public syncState(): WinTitlebarState {
    const selectedTeamId = appTeamsStore.getSelectedTeamId();
    const selectedTeam = selectedTeamId ? teamStore.getTeam(selectedTeamId) : null;

    return {
      selectedTeamId,
      selectedTeam
    };
  }

  public render(): JSX.Element | null {
    const { defaultTitle, defaultBackgroundColor, defaultTextColor } = this.props;
    let backgroundColor = defaultBackgroundColor;
    let textColor = defaultTextColor;
    let title = defaultTitle;
    let sidebarColor;

    if (this.state.selectedTeam) {
      sidebarColor = getSidebarColor(this.state.selectedTeam);
      backgroundColor = Color(sidebarColor).darken(0.15).rgbaString();
      textColor = getTextColor(this.state.selectedTeam);
      title = $intl.t('Slack - {teamName}', LOCALE_NAMESPACE.GENERAL)({ teamName: this.state.selectedTeam.team_name });
    }

    const style = { backgroundColor, color: textColor };

    return (
      <div className='Windows-Titlebar' style={style}>
        <RazerChroma keyboardColor={Color(sidebarColor)} />
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
