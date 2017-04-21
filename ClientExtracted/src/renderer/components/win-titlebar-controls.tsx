/**
 * @module RendererComponents
 */ /** for typedoc */

import { Component } from '../../lib/component';
import { remote } from 'electron';
import { logger } from '../../logger';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/merge';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';

import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface WinWindowControlsProps {
  fillColor?: string;
};

export interface WinWindowControlsState {
  isMaximized: boolean;
};

export class WinWindowControls extends Component<WinWindowControlsProps, WinWindowControlsState> {
  public static readonly defaultProps: WinWindowControlsProps = {
   fillColor: '#fff'
  };

  private readonly window: Electron.BrowserWindow;
  private unmaximizeBtn: HTMLElement;
  private maximizeBtn: HTMLElement;
  private minimizeBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private readonly refHandlers = {
    unmaximize: (ref: HTMLElement) => this.unmaximizeBtn = ref,
    maximize: (ref: HTMLElement) => this.maximizeBtn = ref,
    minimize: (ref: HTMLElement) => this.minimizeBtn = ref,
    close: (ref: HTMLElement) => this.closeBtn = ref,
  };

  constructor(props: WinWindowControlsProps) {
    super(props);

    this.window = remote.getCurrentWindow();

    //setup eventhandlers once component is ready
    this.componentMountedObservable.filter((x: boolean) => x)
      .first()
      .subscribe(() => {
        if (this.window) {
          if (this.window.isMaximized()) {
            this.state = { isMaximized: true };
          }

          this.disposables.add(Observable.merge(
            Observable.fromEvent(this.window, 'enter-full-screen'),
            Observable.fromEvent(this.window, 'maximize'))
            .takeUntil(this.componentMountedObservable.filter((x: boolean) => !x))
            .subscribe(() => this.setState({ isMaximized: true })));

          this.disposables.add(Observable.merge(
            Observable.fromEvent(this.window, 'leave-full-screen'),
            Observable.fromEvent(this.window, 'unmaximize'))
            .takeUntil(this.componentMountedObservable.filter((x: boolean) => !x))
            .subscribe(() => this.setState({ isMaximized: false })));
        } else {
          logger.warn('WinTitleBar: Titlebar could not find window object');
        }
      });

  }

  public render(): JSX.Element | null {
    const { fillColor } = this.props;

    return (
      <div className='Windows-Titlebar-controls'>
        <button
          ref={this.refHandlers.minimize}
          title={$intl.t(`Minimize`, LOCALE_NAMESPACE.GENERAL)()}
          className='Windows-Titlebar-button'
          onMouseDown={this.handleMouseDown}
          onClick={this.minimize.bind(this)}
        >
          <svg className='Windows-Titlebar-icon' x='0px' y='0px' viewBox='0 0 10.2 1'>
            <rect fill={fillColor} width='10.2' height='1'/>
          </svg>
        </button>
        {this.renderMaximize()}
        <button
          ref={this.refHandlers.close}
          title={$intl.t(`Close`, LOCALE_NAMESPACE.GENERAL)()}
          className='Windows-Titlebar-button'
          onMouseDown={this.handleMouseDown}
          onClick={this.close.bind(this)}
        >
          <svg className='Windows-Titlebar-icon' x='0px' y='0px' viewBox='0 0 10.2 10.2'>
            <polygon
              fill={fillColor}
              points='10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1 '
            />
          </svg>
        </button>
      </div>
    );
  }

  private renderMaximize() {
    const { fillColor } = this.props;
    const { isMaximized } = this.state;

    if (isMaximized) {
      return (
        <button
          ref={this.refHandlers.unmaximize}
          title={$intl.t(`Unmaximize`, LOCALE_NAMESPACE.GENERAL)()}
          className='Windows-Titlebar-button'
          onMouseDown={this.handleMouseDown}
          onClick={this.unmaximize.bind(this)}
        >
           <svg className='Windows-Titlebar-icon' x='0px' y='0px' viewBox='0 0 10.2 10.2'>
            <path
              fill={fillColor}
              d='M2.1,0v2H0v8.1h8.2v-2h2V0H2.1z M7.2,9.2H1.1V3h6.1V9.2z M9.2,7.1h-1V2H3.1V1h6.1V7.1z'
            />
          </svg>
        </button>
      );
    } else {
      return (
        <button
          ref={this.refHandlers.maximize}
          title={$intl.t(`Maximize`, LOCALE_NAMESPACE.GENERAL)()}
          className='Windows-Titlebar-button'
          onMouseDown={this.handleMouseDown}
          onClick={this.maximize.bind(this)}
        >
           <svg className='Windows-Titlebar-icon' x='0px' y='0px' viewBox='0 0 10.2 10.2'>
            <path
              fill={fillColor}
              d='M0,0v10.1h10.2V0H0z M9.2,9.2H1.1V1h8.1V9.2z'
            />
          </svg>
        </button>
      );
    }
  }

  /**
   * Ensures that focus isn't taken by the button.
   */
  private handleMouseDown(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
  }

  private unmaximize() {
    if (this.window) {
      this.window.isFullScreen() ? this.window.setFullScreen(false) : this.window.unmaximize();
    }
  }

  private maximize() {
    if (this.window) {
      this.window.maximize();
    }
  }

  private minimize() {
    if (this.window) {
      this.window.minimize();
    }
  }

  private close() {
    if (this.window) {
      this.window.close();
    }
  }
};
