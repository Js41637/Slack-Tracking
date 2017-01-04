import * as React from 'react'; // tslint:disable-line
import {Observable} from 'rxjs';

import Component from '../../lib/component';
import {remote} from 'electron';
import {eventActions} from '../../actions/event-actions';

export interface WinHamburgerProps {
  fillColor?: string;
};

export interface WinHamburgerState {};

export class WinHamburger extends Component<WinHamburgerProps, WinHamburgerState> {
  public static readonly defaultProps: WinHamburgerProps = {
   fillColor: '#fff'
  };

  private readonly window: Electron.BrowserWindow;
  private hamburgerBtn: HTMLElement;
  private readonly refHandlers = {
    hamburger: (ref: HTMLElement) => this.hamburgerBtn = ref,
  };

  constructor(props: WinHamburgerProps) {
    super(props);

    this.window = remote.getCurrentWindow();
  }

  public componentWillMount() {
    const keyboardListener = this.listenToAltPress()
                                 .subscribe(() => eventActions.popupAppMenu(true));
    this.disposables.add(keyboardListener);
  }

  public render(): JSX.Element | null {
    const { fillColor } = this.props;

    return (
      <div className='Windows-Titlebar-hamburger'>
        <button ref={this.refHandlers.hamburger} title='Menu' className='Windows-Titlebar-button' onMouseDown={this.handleMouseDown.bind(this)}>
          <svg className='Windows-Titlebar-icon' x='0px' y='0px' viewBox='0 0 10.2 10.2'>
            <rect fill={fillColor} width='10' height='1'/>
            <rect fill={fillColor} y='4' width='10.2' height='1'/>
            <rect fill={fillColor} y='8' width='10.2' height='1'/>
          </svg>
        </button>
      </div>
    );
  }

  private handleMouseDown(e: Event): void {
    e.preventDefault();
    eventActions.popupAppMenu(false);
  }

  private listenToAltPress() {
    const keyDown = Observable.fromEvent(document, 'keydown', (e) => e.keyCode);
    const keyUp = Observable.fromEvent(document, 'keyup', (e) => e.keyCode);
    const altDown = keyDown.filter(x => x === 18);
    const altUp = keyUp.filter(x => x === 18);

    // Only fires once per alt-down, ignores key repeat
    const debouncedAltDown = altDown
      .take(1)
      .concat(Observable.timer(10 * 1000))    // Observable.never with insurance against lost events
      .takeUntil(altUp)
      .repeat();

    const keyUpOrMouseClick = Observable.merge(
      keyUp,
      Observable.fromEvent(document, 'mousedown', {capture: true},  () => 0)
    );

    return debouncedAltDown
      .switchMap(() => keyUpOrMouseClick
        .filter(x => x !== 18)
        .takeUntil(altUp)
        .reduce((acc: Array<any>, x: any) => { acc.push(x); return acc; }, []))
      .filter(x => x.length === 0)
      .map(() => true);
  }
}
