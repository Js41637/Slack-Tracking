/**
 * @module RendererComponents
 */ /** for typedoc */

import * as Kolor from 'color';
import { rendererRequireDirect } from 'electron-remote';
import * as fs from 'fs';
import { Observable } from 'rxjs';

import { remote } from 'electron';
import { TeamBase } from '../../actions/team-actions';
import { p } from '../../get-path';
import { Component } from '../../lib/component';
import { logger } from '../../logger';
import { NotificationEvent } from '../../reducers/notifications-reducer';
import { notificationStore } from '../../stores/notification-store';
import { teamStore } from '../../stores/team-store';
import { StringMap } from '../../utils/shared-constants';

declare function requestIdleCallback(callback: any): any;

export interface ChromaProps {
  keyboardColor: Color.Color;
}

export interface ChromaState {
  numTeams: number;
  teams: StringMap<TeamBase>;
  newNotificationEvent: NotificationEvent;
}

/**
 * A manager-like React component that safely initializes the Razer SDK
 * and sets the color on the keyboard.
 *
 * @class Chroma
 * @extends {Component<ChromaProps, ChromaState>}
 */
export class RazerChroma extends Component<ChromaProps, ChromaState> {
  public initialized: boolean;

  private chroma: any;
  private unsubscribeProxy?: () => {};
  private errored: boolean;
  private window: Electron.BrowserWindow;

  constructor(props: ChromaProps) {
    super(props);

    // Let's avoid even more work!
    if (!this.getHasSynapse()) return;

    requestIdleCallback(() => {
      this.initialize().then(() => {
        this.setKeyboardColor(props.keyboardColor);
        this.setupListeners();
      });
    });
  }

  /**
   * Attempts to guess that anything involving Razer is installed by looking for
   * default Razer programs. That's super-basic and might lead to some users with
   * Razer keyboards not receiving a colored keyboard, but it ensures that those
   * who don't have it for sure get no overhead from this neat little feature.
   *
   * @returns {boolean}
   */
  public getHasSynapse(): boolean {
    const drive = (p`${'SYSTEMROOT'}` || '').charAt(0) || 'C';
    const x86Path = `${drive}:\\Program Files (x86)\\Razer`;
    const x64Path = `${drive}:\\Program Files\\Razer`;

    return !!(fs.statSyncNoException(x64Path) || fs.statSyncNoException(x86Path));
  }

  /**
   * Grabs the razer-chroma module, but in it's own window.
   */
  public async getChroma() {
    if (this.chroma) return;

    try {
      const { module, unsubscribe } = await rendererRequireDirect(require.resolve('razer-chroma'));
      this.unsubscribeProxy = unsubscribe;
      this.chroma = module;
    } catch (err) {
      logger.info(`Tried to initialize Razer Chroma, but failed`, err);
      throw new Error('Could not initialize Razer Chroma Proxy');
    }
  }

  /**
   * Initializes the Razer SDK. If not present, we can safely assume
   * that there's no colored keyboard (or no SDK to talk to, anyway).
   */
  public async initialize() {
    try {
      await this.getChroma();
      this.initialized = this.initialized || await this.chroma.initialize();
      this.window = this.window || remote.getCurrentWindow();
      if (!this.initialized) this.unsubscribe();
    } catch (e) {
      this.errored = true;
      logger.info('Razer Chroma: Failed to initialized Chroma');
    }
  }

  /**
   * Terminate the SDK. This is required to give control back to the system.
   */
  public async terminate() {
    try {
      await this.getChroma();
      this.initialized = !(await this.chroma.terminate());
    } catch (e) {
      this.errored = true;
      logger.info('Razer Chroma: Failed to terminate Chroma');
    }
  }

  /**
   * Ubsubscribes from the proxy
   */
  public unsubscribe() {
    if (this.unsubscribeProxy) {
      this.unsubscribeProxy();
      delete this.unsubscribeProxy;
    }
  }

  /**
   * We ask for the number of teams (to color the ctrl buttons) - as well
   * as the new notification event.
   */
  public syncState(): ChromaState {
    return {
       numTeams: teamStore.getNumTeams(),
       teams: teamStore.teams,
       newNotificationEvent: notificationStore.getNewNotificationEvent()
    };
  }

  /**
   * Are we initialized? Cool, let's color the team.
   */
  public componentWillReceiveProps(nextProps: ChromaProps) {
    if (this.initialized && nextProps.keyboardColor !== this.props.keyboardColor) {
      requestIdleCallback(() => this.setKeyboardColor(nextProps.keyboardColor));
    }
  }

  /**
   * Sets up the listener for ctrl and window focus events.
   */
  public setupListeners() {
    if (this.initialized) {
      this.listenToCtrlPress();
      this.listenToWindowEvents();
    }
  }

  /**
   * Sets the keyboard to a given color. Currently only supports one single color.
   *
   * @param {Color.Color} keyboardColor
   * @returns {void}
   */
  public setKeyboardColor(keyboardColor?: Color.Color|undefined): void {
    if (this.errored || !this.initialized) return;

    keyboardColor = keyboardColor || this.props.keyboardColor;

    const color = keyboardColor.clone().saturate(0.5);
    const singleColor = { red: color.red(), green: color.green(), blue: color.blue() };

    try {
      this.chroma.Keyboard.setStatic(singleColor);
    } catch (e) {
      logger.warn('Razer Chroma: Tried to set Chroma color, but failed.', e);
    }
  }

  /**
   * We're letting a wave flow over the keyboard for a notification event.
   */
  public newNotificationEvent() {
    if (!this.window) return;

    if (!this.window.isFocused() && !this.initialized) {
      this.initialize();
    }

    if (this.initialized) {
      requestIdleCallback(() => this.chroma.Keyboard.setWave());
      setTimeout(() => {
        if (this.window.isFocused()) {
          this.setKeyboardColor();
        } else {
          this.terminate();
        }
      }, 3500);
    }
  }

  /**
   * THE KEYBOARD IS OUR INTERFACE
   */
  public render(): null {
    return null;
  }

  /**
   * Colors the number row of keys according to the number of teams.
   */
  private colorTeamButtons() {
    // Guard against misue: Don't run unless we actually have an SDK-enabled keyboard
    if (!this.initialized) return;

    const keyMap: Array<any> = [[], [], [], [], [], []];
    const color = this.props.keyboardColor.clone().saturate(0.5);
    const bgColor = { red: color.red(), green: color.green(), blue: color.blue() };
    const teams = Object.keys(this.state.teams).map((key) => this.state.teams[key]);
    const fallbackColor = { red: 255, green: 0, blue: 0 };

    keyMap.forEach((_element, row) => {
      for (let column = 0; column < 22; column++) {
        let colorToSet;

        if (row === 1 && column > 0 && column <= this.state.numTeams) {
          const currentTeam = teams[column - 1] || {};
          const theme = currentTeam.theme ? currentTeam.theme.active_presence : null;
          const teamColor = new Kolor(theme || fallbackColor).saturate(0.5);
          colorToSet = { red: teamColor.red(), blue: teamColor.blue(), green: teamColor.green() };
        } else {
          colorToSet = bgColor;
        }

        keyMap[row][column] = colorToSet;
      }
    });

    try {
      this.chroma.Keyboard.setCustom(keyMap);
    } catch (e) {
      logger.warn('Razer Chroma: Tried to set Chroma color, but failed.', e);
    }
  }

  /**
   * Sets up listeners for the window event.
   */
  private listenToWindowEvents() {
    // Guard against misue: Don't run unless we actually have an SDK-enabled keyboard
    if (!this.initialized) return;

    const focusListener = Observable.fromEvent(this.window, 'focus')
      .subscribe(() => {
        this.initialize().then(() => this.setKeyboardColor());
      });

    const blurListener = Observable.fromEvent(this.window, 'blur')
      .subscribe(() => {
        this.terminate();
      });

    this.disposables.add(focusListener);
    this.disposables.add(blurListener);
  }

  /**
   * Sets up listeners for the ctrl keydown event.
   */
  private listenToCtrlPress() {
    // Guard against misue: Don't run unless we actually have an SDK-enabled keyboard
    if (!this.initialized) return;

    const keyDown = Observable.fromEvent(document, 'keydown', (e) => e.keyCode);
    const keyUp = Observable.fromEvent(document, 'keyup', (e) => e.keyCode);

    const ctrlDown = keyDown.filter((x) => x === 17);
    const ctrlUp = keyUp.filter((x) => x === 17);

    const debouncedCtrlDown = ctrlDown
      .throttleTime(250)
      .subscribe(() => this.colorTeamButtons());

    const debouncedCtrlUp = ctrlUp
      .throttleTime(250)
      .subscribe(() => this.setKeyboardColor());

    this.disposables.add(debouncedCtrlDown);
    this.disposables.add(debouncedCtrlUp);
  }
}
