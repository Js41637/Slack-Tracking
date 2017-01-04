import {union} from '../../utils/union';
import difference from 'lodash.difference';
import assignIn from 'lodash.assignin';
import React from 'react';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {async} from 'rxjs/scheduler/async';

import {remote} from 'electron';
const {Menu, MenuItem} = remote;

import AppTeamsStore from '../../stores/app-teams-store';
import Component from '../../lib/component';
import {ScrollableArea} from '../../components/scrollable-area';
import TeamAddButton from './team-add-button';
import TeamSelectorItem from './team-selector-item';
import TeamStore from '../../stores/team-store';
import {TitleBarButtonsContainer} from './title-bar-buttons-container';
import {appTeamsActions} from '../../actions/app-teams-actions';
import {dialogActions} from '../../actions/dialog-actions';
import {eventActions} from '../../actions/event-actions';
import {getScaledBorderRadius} from '../../utils/component-helpers';
import {getSidebarColor, getTextColor} from '../../utils/color';
import {requestGC} from '../../run-gc';
import {settingStore} from '../../stores/setting-store';
import {shallowEqual} from '../../utils/shallow-equal';
import {windowFrameStore} from '../../stores/window-frame-store';

import {SIDEBAR_WIDTH, SIDEBAR_WIDTH_NO_TITLE_BAR} from '../../utils/shared-constants';

const TRANSITION_DURATION = `0.20s`;
const ITEM_LIST_MARGIN_TOP = 17;
const ITEM_LIST_MARGIN_TOP_NO_TITLE_BAR = 36;
const ITEM_MARGIN_BETWEEN = 16;
const ITEM_SIZE = 55;
const ICON_SIZE = 36;
const ICON_MARGIN_LEFT = 14;
const ICON_MARGIN_LEFT_NO_TITLE_BAR = 16;
const OVERFLOW_BLUR_RADIUS = 10;
const OVERFLOW_SCROLL_OFFSET = 7;

export default class TeamSelector extends Component {
  constructor(props) {
    super(props);
    this.state.draggedTeamId = null; // id of dragged team
    this.state.windowHeight = window.innerHeight;
    this.state.hasScrolled = false;
    this.state.hasOverflown = false;

    assignIn(this, {
      draggedNode: null, // The DOM Node being dragged by the mouse
      iconOffsetFromMouse: 0 // The difference in height between the mouse and the top of the dragged icon
    });

    // The transparent 1px preview image that appears next to the mouse on drag
    // Source: "https://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/"
    this.blankDragImg = document.createElement("img");
    this.blankDragImg.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    let m = new Menu();
    m.append(new MenuItem({
      label: '&Sign in to another team…',
      click: this.handleAddClick.bind(this)
    }));

    this.removeTeamMenus = {}; // teamId => Menu
    this.rightClickTeamSelector = m;
    this.updateRemoveTeamMenus(null, this.state);
    this.requestGCLongDelaySubject = new Subject();

    this.requestGCLongDelaySubject
      .throttleTime(10*1000)
      .subscribe(() => requestGC());

    this.teamSelectorBackgroundClick = new Subject();

    this.teamSelectorBackgroundClick
      .concatMap(() => {
        return this.teamSelectorBackgroundClick
          .take(7)
          .reduce(() => true)
          .timeout(2000);
      })
      .retry()
      .subscribe(() => dialogActions.toggleDevTools());

    this.teamSelectorBackgroundClick
      .subscribe(props.sidebarClicked);

    this.teamIndexSubject = new Subject();
    this.teamIndexSubject
      .asObservable()
      .observeOn(async)
      .subscribe(appTeamsActions.setTeamsByIndex);
  }

  syncState() {
    let teams = TeamStore.getTeams();
    let teamsByIndex = AppTeamsStore.getTeamsByIndex();

    this.updateTeamIndices(teamsByIndex);

    let isTitleBarHidden = settingStore.getSetting('isTitleBarHidden');

    let itemListTopMargin = isTitleBarHidden ? ITEM_LIST_MARGIN_TOP_NO_TITLE_BAR : ITEM_LIST_MARGIN_TOP;
    this.itemListLeftMargin = isTitleBarHidden ?
      ICON_MARGIN_LEFT_NO_TITLE_BAR : ICON_MARGIN_LEFT;

    return {
      teams: teams,
      teamsByIndex: teamsByIndex,
      selectedTeamId: AppTeamsStore.getSelectedTeamId(),
      hiddenTeams: AppTeamsStore.getHiddenTeams(),
      isMac: settingStore.isMac(),
      isWin10: settingStore.getSetting('isWin10'),
      isTitleBarHidden: isTitleBarHidden,
      itemListTopMargin,
      isFullScreen: windowFrameStore.isFullScreen()
    };
  }

  // Save a reference between teams and indices for quick access during repetitive drag methods
  updateTeamIndices(teamsByIndex) {
    this.teamIndices = teamsByIndex.reduce(
      (result, team, index) => { result[team] = index; return result; }
    , {});
  }

  componentDidMount() {
    let resizeSubscription = Observable.fromEvent(window, 'resize')
      .throttleTime(200)
      .subscribe(this.handleWindowResize.bind(this));

    let scrollSubscription = this.refs.scrollable.observeScroll()
      .subscribe(this.handleScroll.bind(this));

    if (this.state.isMac) {
      let ctrlTabSubscription = Observable.fromEvent(document, 'keyup')
        .filter((e) => e.key === 'Tab' && e.ctrlKey)
        .map((e) => e.shiftKey ? appTeamsActions.selectPreviousTeam : appTeamsActions.selectNextTeam)
        .subscribe((action) => action());

      this.disposables.add(ctrlTabSubscription);
    }

    this.disposables.add(resizeSubscription);
    this.disposables.add(scrollSubscription);

    this.handleWindowResize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(nextState, this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedTeamId &&
      prevState.selectedTeamId !== this.state.selectedTeamId &&
      this.refs[`itemFor${this.state.selectedTeamId}`]) {
      this.refs[`itemFor${this.state.selectedTeamId}`].scrollIntoViewIfNeeded();
      this.requestGCLongDelaySubject.next(true);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateRemoveTeamMenus(this.state, nextState);
  }

  updateRemoveTeamMenus(currState, nextState) {
    let currTeams = currState ? Object.keys(currState.teams) : {};
    let nextTeams = nextState ? Object.keys(nextState.teams) : {};
    let newTeams = difference(nextTeams, currTeams);

    Object.keys(newTeams).forEach((key) => {
      let teamId = newTeams[key];
      if (!this.removeTeamMenus[teamId]) {
        let menu = new Menu();

        menu.append(new MenuItem({
          label: `&Remove ${nextState.teams[teamId].team_name}`,
          click: () => eventActions.signOutTeam(teamId)
        }));

        this.removeTeamMenus[teamId] = menu;
      }
    });
  }

  handleDragStart(teamId) {
    return (evt) => {
      // Just bail if the we happen to pick up a drag event with any files attached
      if (evt.dataTransfer.files.length > 0) {
        evt.preventDefault();
        return;
      }

      evt.dataTransfer.setDragImage(this.blankDragImg, 0, 0);
      evt.dataTransfer.effectAllowed = "none";

      this.draggedNode = this.refs[`itemFor${teamId}`];
      this.draggedNode.style.setProperty('transition-duration', `0s`);
      let iconTop = this.draggedNode.getBoundingClientRect().top;
      this.setState({draggedTeamId: teamId});

      this.iconOffsetFromMouse = evt.clientY - iconTop;
    };
  }

  // Whether or not an icon at currTop has moved to overlap with any other indices
  hasMoved(origIndex, currTop) {
    let origTop = this.getTop(origIndex);
    let above = currTop < origTop - ITEM_MARGIN_BETWEEN - (ITEM_SIZE - ICON_SIZE);
    let below = currTop > origTop + ITEM_SIZE + ITEM_MARGIN_BETWEEN - ICON_SIZE;

    // If the index is the first/last team, ignore above/below since there are no teams to replace
    if (origIndex >= this.state.teamsByIndex.length - 1) below = false;
    if (origIndex <= 0) above = false;

    return above || below;
  }

  /*
    If the dragged icon has moved outside of its bounds, determine which
    icons should be above or below it, then set their indices based on
    that calculation.
  */
  handleDrag() {
    return (evt) => {
      if (evt.clientY > 0) { // drag events have a massive negative number at the end
        // Constrain drag to top of team selector container
        if (evt.clientY <= ITEM_LIST_MARGIN_TOP_NO_TITLE_BAR) {
          return;
        }
        let draggedTeamId = this.state.draggedTeamId;
        let draggedIndex = this.getIndexOfTeam(draggedTeamId);
        let scrollTop = this.refs.scrollable.ScrollTop;
        let draggedItemY = scrollTop + evt.clientY - this.iconOffsetFromMouse;

        this.draggedNode.style.setProperty(`transform`, `translate3d(0px, ${draggedItemY}px, 0px)`);

        if (!this.hasMoved(draggedIndex, draggedItemY))
          return;

        let above = [];
        let below = [];

        // For every team in order of lowest to highest index, add them to either
        // the above or below arrays to determine whether they are above or below
        // the dragged icon
        this.state.teamsByIndex.forEach((teamId, index) => {
          if (teamId == draggedTeamId) return; // Skip the dragged node checking itself

          let iconTop = this.getTop(index);

          let isAbove = iconTop < draggedItemY + ICON_SIZE; // If any part of other icon is above dragged
          let isBelow = draggedItemY < iconTop + ICON_SIZE; // If any part of other icon is below dragged

          // If the node is seen as both above and below, there is an overlap. This
          // means a swap occurs, so isAbove becomes the opposite of what it should be
          if (isAbove && isBelow) {
            isAbove = index > draggedIndex;
          }

          (isAbove ? above : below).push(teamId); // Add the team to its appropriate list
        });

        if (above.length === draggedIndex) return;
        let newTeamsByIndex = union(above, [draggedTeamId], below);

        // HACK: We manually update the state here for performance reasons, as going through
        // the entire flux-ipc flow would take too long.  Any actions while the mouse is busy
        // dragging aren't possible anyway, so we shouldn't experience any issues
        this.updateTeamIndices(newTeamsByIndex);
        this.setState({teamsByIndex: newTeamsByIndex});
        this.forceUpdate();
      }
    };
  }

  handleDragEnd(teamId) {
    return () => {
       // Return the transition duration back to normal so that the dragged node
       // slides back into place after the user releases it.
      this.draggedNode.style.setProperty('transition-duration', TRANSITION_DURATION);
      this.draggedNode.style.setProperty('transform', `translate3d(0px, ${this.getTop(this.getIndexOfTeam(teamId))}px, 0px)`);
      this.setState({draggedTeamId: null});

      this.teamIndexSubject.next(this.state.teamsByIndex);
    };
  }

  handleWindowResize() {
    let sizeOfList = this.getTop(this.state.teamsByIndex.length);

    this.setState({hasOverflown: window.innerHeight <= sizeOfList + ITEM_SIZE});
  }

  handleScroll() {
    this.setState({
      hasScrolled: this.refs.scrollable.ScrollTop >= OVERFLOW_BLUR_RADIUS - OVERFLOW_SCROLL_OFFSET
    });
  }

  getIndexOfTeam(teamId) {
    if (this.state.hiddenTeams.length > 0) {
      const realIndex = this.teamIndices[teamId];
      const lowerHidden = this.state.hiddenTeams.filter((t) => this.teamIndices[t] < realIndex);
      return realIndex - lowerHidden.length;
    }

    return this.teamIndices[teamId];
  }

  // Returns the Y position of the top of a TeamSelectorItem at {index}
  getTop(index) {
    let {itemListTopMargin, isTitleBarHidden, isFullScreen} = this.state;
    if (isTitleBarHidden && isFullScreen) {
      itemListTopMargin = ITEM_LIST_MARGIN_TOP;
    }
    return (index) * (ITEM_MARGIN_BETWEEN + ITEM_SIZE) + itemListTopMargin;
  }

  handleAddClick() {
    dialogActions.showLoginDialog();
  }

  handleSelectorBackgroundClick() {
    this.teamSelectorBackgroundClick.next(true);
  }

  handleRightClick(e) {
    e.stopPropagation();
    e.preventDefault();

    this.rightClickTeamSelector.popup(remote.getCurrentWindow());
  }

  handleRightClickItem(e, teamId) {
    e.stopPropagation();
    e.preventDefault();

    this.removeTeamMenus[teamId].popup(remote.getCurrentWindow());
  }

  renderTitleBarButtonsContainer(backgroundColor) {
    if (this.state.teamsByIndex.length > 0 && !this.state.isFullScreen && !this.state.isWin10) {
      return (
        <TitleBarButtonsContainer
          backgroundColor={backgroundColor}
          blurRadius={OVERFLOW_BLUR_RADIUS}
          isTitleBarHidden={this.state.isTitleBarHidden}
          hasOverflown={this.state.hasOverflown}
          hasScrolled={this.state.hasScrolled}
        />
      );
    }
  }

  render() {
    const {hiddenTeams, teams, teamsByIndex, selectedTeamId, draggedTeamId,
      isTitleBarHidden, isMac, hasOverflown} = this.state;
    let selectedTeam = teams[selectedTeamId];
    let backgroundColor = getSidebarColor(selectedTeam);
    let textColor = getTextColor(selectedTeam);
    let dragInProgress = !!draggedTeamId;
    let iconBorderRadius = getScaledBorderRadius(ICON_SIZE);

    // Have to iterate over teams rather than teamsByIndex due to animation issues
    let teamSelectorItems = Object.keys(teams).filter((teamId) => !hiddenTeams.includes(teamId)).map((teamId) => {
      let team = teams[teamId];
      let index = this.getIndexOfTeam(teamId);
      let isDragged = draggedTeamId === teamId;
      let itemTop = isDragged ? undefined : this.getTop(index);

      return (
        <div className="TeamSelector-item"
          key={teamId}
          title={team.team_name}
          style={{
            position: 'absolute',
            transitionDuration: isDragged ? '0s' : TRANSITION_DURATION,
            transform: `translate3d(0px, ${itemTop}px, 0px)`,
            zIndex: isDragged ? 1 : 0,
            left: this.itemListLeftMargin
          }}
          ref={`itemFor${teamId}`}
          draggable
          onContextMenu={(e) => this.handleRightClickItem(e, teamId)}
          onDrag={this.handleDrag(teamId).bind(this)}
          onDragStart={this.handleDragStart(teamId).bind(this)}
          onDragEnd={this.handleDragEnd(teamId).bind(this)}
          >
          <TeamSelectorItem
            index={index}
            team={team}
            selectedTeam={selectedTeam}
            selectorLeftOffset={-this.itemListLeftMargin}
            iconSize={ICON_SIZE}
            borderRadius={iconBorderRadius}
          />
        </div>
      );
    });
    let sizeOfList = this.getTop(teamSelectorItems.length);
    let titleBarButtonsContainer = this.renderTitleBarButtonsContainer(backgroundColor);

    return (
      <div className="TeamSelector"
        onContextMenu={this.handleRightClick.bind(this)}
        onClick={this.handleSelectorBackgroundClick.bind(this)}
        tabIndex="0"
        style={{
          backgroundColor,
          width: isTitleBarHidden ?
            SIDEBAR_WIDTH_NO_TITLE_BAR :
            SIDEBAR_WIDTH
        }}>
        {titleBarButtonsContainer}
        <ScrollableArea
          style={{height: '100%'}}
          maxScroll={hasOverflown ? sizeOfList + ITEM_SIZE : sizeOfList}
          scrollbar={isMac ? 'none' : 'custom'}
          ref="scrollable">
          <div className="TeamSelector-list" style={{
            height: sizeOfList,
            marginBottom: hasOverflown ? ITEM_SIZE : 'unset'
          }}>
            {teamSelectorItems}
          </div>
        </ScrollableArea>

        <TeamAddButton handleAddClick={this.handleAddClick.bind(this)}
          backgroundColor={backgroundColor}
          textColor={textColor}
          itemMarginBetween={ITEM_MARGIN_BETWEEN}
          overflowBlurRadius={OVERFLOW_BLUR_RADIUS}
          sizeOfList={sizeOfList}
          teamsByIndex={teamsByIndex}
          hasOverflown={hasOverflown}
          dragInProgress={dragInProgress}
          borderRadius={iconBorderRadius}
        />
      </div>
    );
  }
}
