/**
 * @module RendererComponents
 */ /** for typedoc */

import { remote } from 'electron';
const { Menu, MenuItem } = remote;
const currentWindow = remote.getCurrentWindow();

import { clamp } from 'lodash';
import * as React from 'react';
import { Motion, spring } from 'react-motion';
import { createEventHandler, setObservableConfig } from 'recompose';
import rxjsconfig from 'recompose/rxjsObservableConfig';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { appTeamsActions } from '../../actions/app-teams-actions';
import { dialogActions } from '../../actions/dialog-actions';
import { eventActions } from '../../actions/event-actions';
import { Component } from '../../lib/component';
import { TeamsState } from '../../reducers/teams-reducer';
import { UnreadsState } from '../../reducers/unreads-reducer';
import { appTeamsStore } from '../../stores/app-teams-store';
import { settingStore } from '../../stores/setting-store';
import { teamStore } from '../../stores/team-store';
import { unreadsStore } from '../../stores/unreads-store';
import { windowFrameStore } from '../../stores/window-frame-store';
import { getSidebarColor, getTextColor } from '../../utils/color';
import { getScaledBorderRadius } from '../../utils/component-helpers';
import { ScrollableArea } from './scrollable-area';
import { TeamAddButton } from './team-add-button';
import { TeamSidebarItem } from './team-sidebar-item';
import { TitleBarButtonsContainer } from './title-bar-buttons-container';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
import { noop } from '../../utils/noop';
import { SIDEBAR_ICON_SIZE, SIDEBAR_ITEM_MARGIN_LEFT, SIDEBAR_ITEM_MARGIN_TOP,
  SIDEBAR_ITEM_MARGIN_TOP_NO_TITLE_BAR, SIDEBAR_ROW_HEIGHT,
  SIDEBAR_WIDTH } from '../../utils/shared-constants';

const SIDEBAR_ICON_BORDER_RADIUS = getScaledBorderRadius(SIDEBAR_ICON_SIZE);
const MOUSE_LEFT_BUTTON = 0;
const DRAG_MOVE_THRESHOLD = 6;

export interface TeamSidebarProps {
  sidebarClicked: () => void;
}

export interface TeamSidebarState {
  teams: TeamsState;
  teamsByIndex: Array<string>;
  unreads: UnreadsState;
  numberOfTeams: number;
  sidebarItemOffset: Array<number>;
  isTitleBarHidden: boolean;
  selectedTeamId: string | null;
  isFullScreen: boolean;
  isMac: boolean;
  isWin10: boolean;

  mouseY?: number;
  selectedTeamToDrag?: string | null;
  locale: string;
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

interface ClickTarget<T> {
  teamId: string | null;
  event: T;
}

interface DragEventArgs<T> extends ClickTarget<T> {
  teamId: string;
  pressY: number;
}

interface MovePosition {
  pageY: number;
  clientY: number;
  identifier?: number; //unique id for distinguish between different touch
}

interface DragTargetPosition extends MovePosition {
  teamId: string;
  pressY: number;
}

type movePositionSelector = (o: Observable<TouchEvent | MouseEvent>) => Observable<MovePosition>;
type syntheticTouch = React.TouchEvent<HTMLDivElement>;
type syntheticMouse = React.MouseEvent<HTMLDivElement>;
type dragTouch = DragEventArgs<syntheticTouch>;
type dragMouse = DragEventArgs<syntheticMouse>;

setObservableConfig(rxjsconfig);

export class TeamSidebar extends Component<TeamSidebarProps, TeamSidebarState> {
  private onSidebarClicked: (value: {}) => void;

  private readonly touchSignal = createEventHandler<dragTouch, Observable<dragTouch>>();
  private readonly mouseSignal = createEventHandler<dragMouse, Observable<dragMouse>>();

  //inlining this will make TS language service confuses between generic to JSX syntax
  private readonly contextMenuSignal = createEventHandler<
    ClickTarget<syntheticMouse>, Observable<ClickTarget<syntheticMouse>>>();

  private readonly eventHandlers = {
    onTouch: (teamId: string, pressY: number) => (event: syntheticTouch) => this.touchSignal.handler({ teamId, pressY, event }),
    onMouseClick: (teamId: string, pressY: number) => (event: syntheticMouse) => this.mouseSignal.handler({ teamId, pressY, event }),
    onContextMenu: (teamId: string | null = null) => (event: syntheticMouse) => this.contextMenuSignal.handler({ teamId, event })
  };

  constructor(props: TeamSidebarProps) {
    super(props);

    this.state = {
      ...this.state,
      mouseY: 0,
      teamsByIndex: appTeamsStore.getTeamsByIndex()
    };

    //setup eventhandlers once component is ready
    this.componentMountedObservable.filter((x: boolean) => x)
      .subscribe(() => {
        this.setupMouseDragEventHandler();
        this.setupTouchDragEventHandler();
      });
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
      unreads: unreadsStore.unreads,
      numberOfTeams: teamStore.getNumTeams(),
      selectedTeamId: appTeamsStore.getSelectedTeamId(),
      isMac: settingStore.isMac(),
      isWin10: settingStore.getSetting<boolean>('isWin10'),
      locale: settingStore.getSetting<string>('locale'),
    };
  }

  public componentDidMount(): void {
    const clicksWithinSidebar = this.handleClicksWithinSidebar();
    this.onSidebarClicked = clicksWithinSidebar.handler;
    this.disposables.add(clicksWithinSidebar.subscription);

    if (this.state.isMac) {
      this.disposables.add(this.selectTeamUsingCtrlTab());
    }
  }

  /**
   * Since we're not updating teamsByIndex from the store (i.e., it's not
   * declared in `syncState`), we have to manually update it when a team is
   * added or removed. This ain't pretty.
   */
  public componentWillUpdate(nextProps: TeamSidebarProps, nextState: Partial<TeamSidebarState>) {
    super.componentWillUpdate(nextProps, nextState);
    const didTeamsChange = this.state.numberOfTeams !== nextState.numberOfTeams;

    if (didTeamsChange) {
      this.setState({ teamsByIndex: appTeamsStore.getTeamsByIndex() });
    }
  }

  public render(): JSX.Element {
    const { teams, teamsByIndex, selectedTeamId, unreads,
      isMac, sidebarItemOffset, selectedTeamToDrag, mouseY } = this.state as TeamSidebarState;

    const isDragging = !!selectedTeamToDrag;

    const selectedTeam = teams[selectedTeamId!];
    const backgroundColor = getSidebarColor(selectedTeam);
    const textColor = getTextColor(selectedTeam);
    const [left, top] = sidebarItemOffset;

    const teamSidebarItems = Object.keys(teams)
      .map((teamId: string) => {
        const team = teams[teamId];
        const unreadsInfo = unreads[teamId];
        const order = teamsByIndex.indexOf(teamId);

        const renderTeamSidebarItem = ({ y, scale, shadow }: MotionCallbackArgs) => {
          const itemStyle: React.CSSProperties = {
            left,
            top,
            transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
            zIndex: teamId === selectedTeamToDrag ? 1 : 0,
            color: textColor
          };

          return (
            <div
              style={itemStyle}
              title={team.team_name}
              className='TeamSidebar-item'
              onMouseDown={this.eventHandlers.onMouseClick(teamId, y)}
              onContextMenu={this.eventHandlers.onContextMenu(teamId)}
              onTouchStart={this.eventHandlers.onTouch(teamId, y)}
              onTouchEnd={this.eventHandlers.onTouch(teamId, y)}
            >
              <TeamSidebarItem
                index={order}
                team={team}
                unreadsInfo={unreadsInfo}
                selectedTeam={selectedTeam}
                iconSize={SIDEBAR_ICON_SIZE}
                boxShadow={`rgba(0, 0, 0, 0.25) 0px ${shadow}px ${2 * shadow}px 0px`}
                borderRadius={SIDEBAR_ICON_BORDER_RADIUS}
              />
            </div>
          );
        };

        const useDraggingStyle = !!selectedTeamToDrag && selectedTeamToDrag === teamId;
        const style: React.CSSProperties = useDraggingStyle ? {
          y: mouseY,
          scale: spring(1.2),
          shadow: spring(16)
        } : {
          y: spring(order * SIDEBAR_ROW_HEIGHT),
          scale: spring(1),
          shadow: spring(1)
        };

        return (
          <Motion style={style} key={teamId} >
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
        onContextMenu={this.eventHandlers.onContextMenu()}
      >
        {this.renderTitleBarButtonsContainer(backgroundColor)}

        <ScrollableArea
          style={{ height: '100%' }}
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
   * MouseEvent / Touch isn't plain object provides keys via Object.keys(), Cannot use utils/pick implementation instead do simple destructuring.
   * also there isn't union type between MouseEvent / Touch, cast to any for param
   */
  private readonly pickPosition = ({ pageY, clientY, identifier }: any) => ({ pageY, clientY, identifier });

  /**
   * Mouse move and up events need to be handled at the window level rather
   * than the item, so that the drag can be completed even outside the bounds
   * of the sidebar.
   */
  private setupMouseDragEventHandler(): void {
    const moveEventObservable = Observable.fromEvent<MouseEvent>(window, 'mousemove');
    const startDragObservable = this.mouseSignal.stream.filter((x) => {
      return x.event.button === MOUSE_LEFT_BUTTON && !x.event.ctrlKey;
    });
    const endDragObservable = Observable.fromEvent(window, 'mouseup');
    const startPositionObservable = startDragObservable.map((x) => ({
      teamId: x.teamId,
      pressY: x.pressY,
      pageY: x.event.pageY,
      clientY: x.event.clientY
    }));

    this.setupDragEventHandler(moveEventObservable, startDragObservable, endDragObservable, startPositionObservable, (v) => v.map(this.pickPosition));
    this.setupContextMenuEventHandler(startDragObservable, endDragObservable);
  }

  private setupTouchDragEventHandler(): void {
    const moveEventObservable = Observable.fromEvent<TouchEvent>(window, 'touchmove');
    const [startDragObservable, endDragObservable] = this.touchSignal.stream.partition((x) => x.event.touches.length > 0);
    const startPositionObservable = startDragObservable.map((x) => Object.assign(({
      teamId: x.teamId,
      pressY: x.pressY
    }), this.pickPosition(x.event.changedTouches.item(0))));

    const dragPositionSelector: movePositionSelector = (v: Observable<TouchEvent>) =>
      v.filter((x) => !!x.changedTouches.item(0)).map((x) => this.pickPosition(x.changedTouches.item(0)));

    this.setupDragEventHandler(moveEventObservable, startDragObservable, endDragObservable, startPositionObservable, dragPositionSelector);
    this.setupContextMenuEventHandler(startDragObservable, endDragObservable);
  }

  private setupDragEventHandler(moveEventObservable: Observable<TouchEvent | MouseEvent>,
                                startDragObservable: Observable<DragEventArgs<syntheticMouse | syntheticTouch>>,
                                endDragObservable: Observable<any>,
                                startPositionObservable: Observable<DragTargetPosition>,
                                selector: movePositionSelector) {
    const isOutThreshold = (start: number, moved: number) => Math.abs(start - moved) > DRAG_MOVE_THRESHOLD;

    const getDragPosition = ({ movePosition, startPosition }: { movePosition: MovePosition, startPosition: DragTargetPosition }) =>
      ({
        teamId: startPosition.teamId,
        mouseY: movePosition.clientY - (startPosition.clientY - startPosition.pressY) //movedY - topDeltaY
      });

    const dragTeamIcon = (x: {
      mouseY: number,
      teamId: string
    }) => {
      const { teamsByIndex } = this.state;
      const { mouseY, teamId } = x;
      const currentRow = clamp(Math.round(mouseY / SIDEBAR_ROW_HEIGHT), 0, teamsByIndex.length - 1);
      const dragIndex = teamsByIndex.indexOf(teamId);

      const state = currentRow !== dragIndex ? {
        mouseY,
        selectedTeamToDrag: teamId,
        teamsByIndex: reinsert(teamsByIndex, dragIndex, currentRow)
      } : {
        mouseY
      };

      this.setState(state as TeamSidebarState);
    };

    //Set teams by index in the store after drag completes.
    const setupRepositionTeamEventHandler = (dragObservable: Observable<any>) =>
      dragObservable
        .do(noop, noop, () => this.setState({ selectedTeamToDrag: null })) //completes drag once move stops and mouse up immediately
        .debounceTime(100)
        .takeLast(1)
        .map(() => this.state.teamsByIndex)
        .filter((x: Array<string>) => !!x && x.length > 0)
        .map((x: Array<string>) => x.filter((t: string) => !!t))
        .subscribe(appTeamsActions.setTeamsByIndex);

    //if mouse move stops within given threshold only, consider it as click to select team
    const setupSelectTeamEventHandler = (dragObservable: Observable<any>, teamId: string) =>
      dragObservable.isEmpty().filter((x) => x).subscribe(() => appTeamsActions.selectTeam(teamId));

    //apply selector to map TouchEvent or MouseEvent into commont structure, then apply filter to take out elements within threshold in given window
    const getDragObservable = (window: [Observable<TouchEvent | MouseEvent>, DragTargetPosition]) => {
      const startPosition = window[1];
      const dragObservable = window[0].let(selector)
        .filter((p: MovePosition) => isOutThreshold(startPosition.pageY, p.pageY))
        //only emits if drag event comes from same touch. MouseEvent will be always true
        .filter((p: MovePosition) => startPosition.identifier === p.identifier)
        .map((movePosition: MovePosition) => ({ movePosition, startPosition }));

      setupRepositionTeamEventHandler(dragObservable);

      //do not setup select team event handler for touch event (where identifier exists)
      //single touch event (press, or press-and-hold) interop into click / context menu event,
      //so register for touch event will invoke same action twice when team is selected via touch
      if (!Number.isInteger(startPosition.identifier!)) {
        setupSelectTeamEventHandler(dragObservable, startPosition.teamId);
      }
      return dragObservable;
    };

    moveEventObservable
      .takeUntil(this.componentMountedObservable.filter((x: boolean) => !x))
      //Creates window observable emits move event between drag start to end, represents move event only within drag period
      .windowToggle(startDragObservable, () => endDragObservable)
      //each time window for drag observable created, picks up latest known target position to pair with move event
      .withLatestFrom(startPositionObservable)
      //get filtered window to rule out within threshold and apply switchmap to only subscriber latest drag movement
      .switchMap(getDragObservable)
      .map(getDragPosition)
      .subscribe(dragTeamIcon);
  }

  /**
   * Subscribe to contextMenuSignal observable forwarded via onContextMenu on sidebar / teamIcon to display popup menu.
   * If there are ongoing dragging events, context menu will not be displayed. This behavior is to prevent press-and-hold
   * touch event shows context menu too early, blocks drag attempt.
   *
   * @param startDragObservable {Observable<any>} Observable emits when drag starts.
   * @param endDragObservable {Observable<any>} Observable emits when drag completes.
   */
  private setupContextMenuEventHandler(startDragObservable: Observable<any>, endDragObservable: Observable<any>): void {
    this.contextMenuSignal.stream.windowToggle(endDragObservable, () => startDragObservable)
      .switchMap((x) => x).subscribe((x) => {
        const event = x.event;
        event.stopPropagation();
        event.preventDefault();

        const menu = this.buildContextMenu(x.teamId);

        //apply additional +2px, to avoid menuitem is auto-selected via mouse click
        //by clientX gives exact position of cursor
        menu.popup(currentWindow, { x: event.clientX + 2, y: event.clientY + 2, async: true } as any);
      });
  }

  private buildContextMenu(teamId: string | null): Electron.Menu {
    let menuItem: Electron.MenuItem;
    if (!!teamId) {
      const { teams, isMac } = this.state;
      // NB: On Mac, '&' characters are removed unless escaped.
      const teamName = isMac ?
        teams[teamId].team_name.replace('&', '&&') :
        teams[teamId].team_name;

      menuItem = new MenuItem({
        // @i18n Do not translate between {}
        label: $intl.t('&Remove {teamName}', LOCALE_NAMESPACE.MENU)({ teamName }),
        click: () => eventActions.signOutTeam(teamId)
      });
    } else {
      const { isMac } = this.state;
      const label = isMac ?
        $intl.t('&Sign in to Another Workspace…', LOCALE_NAMESPACE.MENU)() :
        $intl.t('&Sign in to another workspace…', LOCALE_NAMESPACE.MENU)();

      menuItem = new MenuItem({
        label,
        click: dialogActions.showLoginDialog
      });
    }

    const menu = new Menu();
    menu.append(menuItem);
    return menu;
  }

  /**
   * Handle clicks on the sidebar background, including our secret trick to
   * open devTools.
   *
   * @return {HandlerSubscriptionPair}   Contains the event handler & the subscription
   */
  private handleClicksWithinSidebar(): HandlerSubscriptionPair {
    const { handler, stream } = createEventHandler<any, Observable<boolean>>();
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
}

/**
 * Removes a single element from the source array and reinserts it.
 *
 * @param {Array<any>}  source  The source array
 * @param {Number}      from    The index of the element to remove
 * @param {Number}      to      The index where the element should be inserted
 * @return {Array<any>}         A new array
 */
function reinsert<T>(source: Array<T>, from: number, to: number) {
  const result = [...source];
  const item = result[from];
  result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
