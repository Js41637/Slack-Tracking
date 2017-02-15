import {remote} from 'electron';
const {Menu, MenuItem} = remote;
const currentWindow = remote.getCurrentWindow();

import * as clamp from 'lodash.clamp';
import * as React from 'react';
import rxjsconfig from 'recompose/rxjsObservableConfig';
import {Motion, spring} from 'react-motion';
import {createEventHandler, setObservableConfig} from 'recompose';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';

import {appTeamsStore} from '../../stores/app-teams-store';
import {appTeamsActions} from '../../actions/app-teams-actions';
import {Component} from '../../lib/component';
import {dialogActions} from '../../actions/dialog-actions';
import {eventActions} from '../../actions/event-actions';
import {getScaledBorderRadius} from '../../utils/component-helpers';
import {getSidebarColor, getTextColor} from '../../utils/color';
import {isEqualArrays} from '../../utils/array-is-equal';
import {ScrollableArea} from './scrollable-area';
import {settingStore} from '../../stores/setting-store';
import {TeamAddButton} from './team-add-button';
import {TeamSidebarItem} from './team-sidebar-item';
import {teamStore} from '../../stores/team-store';
import {TitleBarButtonsContainer} from './title-bar-buttons-container';
import {windowFrameStore} from '../../stores/window-frame-store';

import {intl as $intl, LOCALE_NAMESPACE} from '../../i18n/intl';
import {SIDEBAR_WIDTH, SIDEBAR_ROW_HEIGHT, SIDEBAR_ICON_SIZE,
  SIDEBAR_ITEM_MARGIN_LEFT, SIDEBAR_ITEM_MARGIN_TOP,
  SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR} from '../../utils/shared-constants';

const SIDEBAR_ICON_BORDER_RADIUS = getScaledBorderRadius(SIDEBAR_ICON_SIZE);
const MOUSE_LEFT_BUTTON = 0;
const DRAG_MOVE_THRESHOLD = 6;

export interface TeamSidebarProps {
  sidebarClicked: () => void;
}

export interface TeamSidebarState {
  teams: any;
  teamsByIndex: Array<string>;
  numberOfTeams: number;
  hiddenTeams: Array<string>;
  sidebarItemOffset: Array<number>;
  isTitleBarHidden: boolean;
  selectedTeamId: string;
  isFullScreen: boolean;
  isMac: boolean;
  isWin10: boolean;

  topDeltaY: number;
  mouseY: number;
  isMouseDown: boolean;
  isDragging: boolean;
  lastMovedTeamId: string;
  dragMoveDistance: number;
}

interface MotionCallbackArgs {
  y: number;
  scale: number;
  shadow: number;
}

interface HandlerSubscriptionPair {
  handler: (value: {}) => void;
  subscription: Subscription;
}

setObservableConfig(rxjsconfig);

export class TeamSidebar extends Component<TeamSidebarProps, Partial<TeamSidebarState>> {
  private onAnimationEnded: () => void;
  private onSidebarClicked: (value: {}) => void;

  constructor(props: TeamSidebarProps) {
    super(props);

    this.state = {
      ...this.state,
      topDeltaY: 0,
      mouseY: 0,
      dragMoveDistance: 0,
      isDragging: false,
      teamsByIndex: this.getVisibleTeams()
    };
  }

  public syncState(): Partial<TeamSidebarState> {
    const isTitleBarHidden = settingStore.getSetting<boolean>('isTitleBarHidden');
    const isFullScreen = windowFrameStore.isFullScreen();

    const sidebarItemOffset = [
      SIDEBAR_ITEM_MARGIN_LEFT,
      isTitleBarHidden && !isFullScreen ?
        SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR :
        SIDEBAR_ITEM_MARGIN_TOP
    ];

    return {
      sidebarItemOffset,
      isTitleBarHidden,
      isFullScreen,
      teams: teamStore.teams,
      hiddenTeams: appTeamsStore.getHiddenTeams(),
      numberOfTeams: teamStore.getNumTeams(),
      selectedTeamId: appTeamsStore.getSelectedTeamId(),
      isMac: settingStore.isMac(),
      isWin10: settingStore.getSetting<boolean>('isWin10')
    };
  }

  public componentDidMount(): void {
    this.disposables.add(this.handleMouseEventsOnWindow());

    const clicksWithinSidebar = this.handleClicksWithinSidebar();
    this.onSidebarClicked = clicksWithinSidebar.handler;
    this.disposables.add(clicksWithinSidebar.subscription);

    const dragAnimationEnd = this.handleDragAnimationEnd();
    this.onAnimationEnded = dragAnimationEnd.handler as () => void;
    this.disposables.add(dragAnimationEnd.subscription);

    if (this.state.isMac) {
      this.disposables.add(this.selectTeamUsingCtrlTab());
    }
  }

  /**
   * Since we're not updating teamsByIndex from the store (i.e., it's not
   * declared in `syncState`), we have to manually update it when a team is
   * added or removed. This ain't pretty.
   */
  public componentWillUpdate(_nextProps: TeamSidebarProps, nextState: Partial<TeamSidebarState>) {
    const didTeamsChange = this.state.numberOfTeams !== nextState.numberOfTeams ||
      this.state.hiddenTeams!.length !== nextState.hiddenTeams!.length;

    if (didTeamsChange) {
      this.setState({ teamsByIndex: this.getVisibleTeams() });
    }
  }

  public render(): JSX.Element {
    const {teams, teamsByIndex, hiddenTeams, selectedTeamId, isMac,
      sidebarItemOffset, mouseY, isDragging, lastMovedTeamId} = this.state as TeamSidebarState;

    const selectedTeam = teams[selectedTeamId];
    const backgroundColor = getSidebarColor(selectedTeam);
    const textColor = getTextColor(selectedTeam);
    const [left, top] = sidebarItemOffset;

    const teamSidebarItems = Object.keys(teams)
      .filter((teamId) => !hiddenTeams.includes(teamId))
      .map((teamId: string) => {

        const team = teams[teamId];
        const order = teamsByIndex.indexOf(teamId);

        const renderTeamSidebarItem = ({y, scale, shadow}: MotionCallbackArgs) => {
          const itemStyle: React.CSSProperties = {
            left, top,
            transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
            zIndex: teamId === lastMovedTeamId ? 1 : 0,
            color: textColor
          };

          return (
            <div
              style={itemStyle}
              title={team.team_name}
              className='TeamSidebar-item'
              onMouseDown={this.handleMouseDown.bind(this, teamId, y)}
              onContextMenu={this.handleItemContextMenu.bind(this, teamId)}
            >
              <TeamSidebarItem
                index={order}
                team={team}
                selectedTeam={selectedTeam}
                iconSize={SIDEBAR_ICON_SIZE}
                boxShadow={`rgba(0, 0, 0, 0.25) 0px ${shadow}px ${2 * shadow}px 0px`}
                borderRadius={SIDEBAR_ICON_BORDER_RADIUS}
              />
            </div>
          );
        };

        const style = lastMovedTeamId === teamId && isDragging ? {
          y: mouseY,
          scale: spring(1.2),
          shadow: spring(16)
        } : {
          y: spring(order * SIDEBAR_ROW_HEIGHT),
          scale: spring(1),
          shadow: spring(1)
        };

        return (
          <Motion style={style} key={teamId} onRest={this.onAnimationEnded}>
            {renderTeamSidebarItem}
          </Motion>
        );
    });

    const sidebarStyle = {
      backgroundColor,
      width: SIDEBAR_WIDTH
    };

    const addButtonStyle = {
      left,
      top,
      transform: `translate3d(0, ${teamsByIndex.length * SIDEBAR_ROW_HEIGHT}px, 0)`,
      visibility: teamsByIndex.length > 0 ? 'visible' : 'hidden'
    };

    return (
      <div
        className='TeamSidebar'
        style={sidebarStyle}
        tabIndex={0}
        onClick={this.onSidebarClicked}
        onContextMenu={this.handleContextMenu.bind(this)}
      >
        {this.renderTitleBarButtonsContainer(backgroundColor)}

        <ScrollableArea
          style={{height: '100%'}}
          scrollbar={isMac ? 'none' : 'custom'}
        >
          {teamSidebarItems}

          <TeamAddButton
            style={addButtonStyle}
            handleAddClick={dialogActions.showLoginDialog}
            dragInProgress={isDragging}
            backgroundColor={backgroundColor}
            textColor={textColor}
            borderRadius={SIDEBAR_ICON_BORDER_RADIUS}
          />
        </ScrollableArea>
      </div>
    );
  }

  private renderTitleBarButtonsContainer(backgroundColor: string) {
    if (this.state.isWin10) return;
    if (this.state.teamsByIndex!.length === 0) return;
    if (this.state.isFullScreen) return;

    return (
      <TitleBarButtonsContainer
        backgroundColor={backgroundColor}
        isTitleBarHidden={this.state.isTitleBarHidden!}
        zIndex={2}
      />
    );
  }

  /**
   * Mouse move and up events need to be handled at the window level rather
   * than the item, so that the drag can be completed even outside the bounds
   * of the sidebar.
   */
  private handleMouseEventsOnWindow(): Subscription {
    const sub = Observable.fromEvent(window, 'mousemove')
      .subscribe(this.handleMouseMove.bind(this));

    return sub.add(Observable.fromEvent(window, 'mouseup')
      .subscribe(this.handleMouseUp.bind(this)));
  }

  private handleMouseDown(teamId: string, pressY: number, e: MouseEvent): void {
    if (e.button !== MOUSE_LEFT_BUTTON) return;

    this.setState({
      topDeltaY: e.clientY - pressY,
      mouseY: pressY,
      isMouseDown: true,
      lastMovedTeamId: teamId,
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    let { isDragging, dragMoveDistance } = this.state;
    const { teamsByIndex, isMouseDown, topDeltaY, lastMovedTeamId } = this.state as TeamSidebarState;

    // NB: Chrome fires a `mousemove` event immediately after `mousedown`.
    const mouseMoved = e.movementX !== 0 || e.movementY !== 0;
    if (mouseMoved && isMouseDown && !isDragging) {
      dragMoveDistance += normalizedDragDistance(e);
    }

    // NB: Initiate a drag only after the mouse moves some distance. Otherwise
    // it'll be treated as a click.
    if (dragMoveDistance > DRAG_MOVE_THRESHOLD) {
      isDragging = true;
      this.setState({ isDragging, dragMoveDistance: 0 });
    } else {
      this.setState({ dragMoveDistance });
    }

    if (isDragging) {
      const mouseY = e.clientY - topDeltaY;
      const currentRow = clamp(Math.round(mouseY / SIDEBAR_ROW_HEIGHT), 0, teamsByIndex.length - 1);
      const dragIndex = teamsByIndex.indexOf(lastMovedTeamId);

      if (currentRow !== dragIndex) {
        this.setState({ mouseY, teamsByIndex: reinsert(teamsByIndex, dragIndex, currentRow) });
      } else {
        this.setState({ mouseY });
      }
    }
  }

  private handleMouseUp(): void {
    const { isDragging, lastMovedTeamId } = this.state as TeamSidebarState;

    if (!isDragging && lastMovedTeamId) {
      appTeamsActions.selectTeam(lastMovedTeamId);
    }

    this.setState({
      isDragging: false,
      isMouseDown: false,
      lastMovedTeamId: undefined,
      topDeltaY: 0,
      dragMoveDistance: 0
    });
  }

  /**
   * Handles the context menu for each team in the sidebar.
   */
  private handleItemContextMenu(teamId: string, e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();

    const { teams, isMac } = this.state;
    const menu = new Menu();

    // NB: On Mac, '&' characters are removed unless escaped.
    const teamName = isMac ?
      teams[teamId].team_name.replace('&', '&&') :
      teams[teamId].team_name;

    menu.append(new MenuItem({
      label: $intl.t(`&Remove {teamName}`, LOCALE_NAMESPACE.MENU)({ teamName }),
      click: () => eventActions.signOutTeam(teamId)
    }));

    menu.popup(currentWindow);
  }

  /**
   * Handles the context menu elsewhere in the sidebar.
   */
  private handleContextMenu(e: MouseEvent): void {
    e.stopPropagation();
    e.preventDefault();

    const menu = new Menu();

    menu.append(new MenuItem({
      label: $intl.t(`&Sign in to another team…`, LOCALE_NAMESPACE.MENU)(),
      click: dialogActions.showLoginDialog
    }));

    menu.popup(currentWindow);
  }

  /**
   * Set teams by index in the store after animations have finished.
   *
   * @return {HandlerSubscriptionPair}   Contains the event handler & the subscription
   */
  private handleDragAnimationEnd(): HandlerSubscriptionPair {
    const { handler, stream } = createEventHandler<{}, Observable<{}>>();

    const subscription = stream
      .filter(() => !this.state.isDragging)
      .debounceTime(100)
      .map(() => this.state.teamsByIndex)
      .filter((teamsByIndex) => !isEqualArrays(teamsByIndex, this.getVisibleTeams()))
      .subscribe(appTeamsActions.setTeamsByIndex);

    return { handler, subscription };
  }

  /**
   * Handle clicks on the sidebar background, including our secret trick to
   * open devTools.
   *
   * @return {HandlerSubscriptionPair}   Contains the event handler & the subscription
   */
  private handleClicksWithinSidebar(): HandlerSubscriptionPair {
    const { handler, stream } = createEventHandler<{}, Observable<boolean>>();
    const subscription = stream
      .concatMap(() => {
        return stream
          .take(7)
          .reduce(() => true)
          .timeout(2000);
      })
      .retry()
      .subscribe(() => eventActions.toggleDevTools());

    subscription.add(stream.subscribe(this.props.sidebarClicked));
    return { handler, subscription };
  }

  /**
   * Select teams based on Ctrl-Tab / Ctrl-Shift-Tab hotkeys.
   *
   * @return {Subscription}   A Subscription managing the events
   */
  private selectTeamUsingCtrlTab(): Subscription {
    return Observable.fromEvent(document, 'keyup')
      .filter((e: KeyboardEvent) => e.key === 'Tab' && e.ctrlKey)
      .subscribe((e: KeyboardEvent) => e.shiftKey ?
        appTeamsActions.selectPreviousTeam() :
        appTeamsActions.selectNextTeam());
  }

  private getVisibleTeams() {
    return appTeamsStore.getTeamsByIndex({ visibleTeamsOnly: true });
  }
}

/**
 * Removes a single element from the source array and reinserts it.
 *
 * @param {Array<any>}  source  The source array
 * @param {Number}      from    The index of the element to remove
 * @param {Number}      to      The index where the element should be inserted
 * @return {Array<any>}         A new array
 */
function reinsert(source: Array<any>, from: number, to: number) {
  const result = [...source];
  const item = result[from];
  result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/**
 * Take the root sum of squares of the x & y coordinates for a drag event.
 *
 * @param {DragEvent} e           The drag event
 * @param {Number}    e.movementX Mouse movement in the x direction
 * @param {Number}    e.movementY Mouse movement in the y direction
 * @return {Number}               The root sum of squares of x & y
 */
function normalizedDragDistance({ movementX, movementY }: {
  movementX: number, movementY: number
}): number {
  return Math.sqrt(Math.pow(movementX, 2) + Math.pow(movementY, 2));
}
