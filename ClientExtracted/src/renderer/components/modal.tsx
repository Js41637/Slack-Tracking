import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as assignIn from 'lodash.assignin';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';

import {noop} from '../../utils/noop';
import {Component} from '../../lib/component';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface ModalProps {
  width: number;
  height: number;
  flexSize?: boolean; // Whether the modal resizes itself on window shrink
  onRequestClose?: () => void;
  className: string;
  transitionAppear: boolean;
}

export interface ModalState {
  styleOverride: {
    top: number,
    transition: string
  };
}

export class Modal extends Component<ModalProps, ModalState> {
  public static readonly defaultProps: ModalProps = {
    width: 790,
    height: 660,
    onRequestClose: noop,
    className: '',
    transitionAppear: false
  };

  private mainElement: HTMLElement;
  private dialogElement: HTMLElement;
  private readonly refHandlers = {
    main: (ref: HTMLElement) => this.mainElement = ref,
    dialog: (ref: HTMLElement) => this.dialogElement = ref,
  };

  constructor(props: ModalProps) {
    super(props);
  }

  // Initializes the repositioning logic to animate the window centering itself
  public componentDidMount(): void {
    // getBoundingClientRect() doesn't work at first, needs a requestAnimationFrame
    requestAnimationFrame(() => {
      this.setState({ styleOverride: {
        top: this.getCenteredDialogPos(),
        transition: 'all 0.5s ease-out'
      }});
    });

    // Reposition the window on window resize
    this.disposables.add(Observable.fromEvent(window, 'resize').subscribe(() => {
      this.setState({styleOverride: {
        top: this.getCenteredDialogPos(),
        transition: 'none'
      }});
    }));
  }

  public render(): JSX.Element | null {
    const dialogStyle = {
      width: this.props.width,
      height: this.props.height,
      top: '-100%'
    };

    assignIn(dialogStyle, this.state.styleOverride); // Used for animations

    return (
      <div className={`${this.props.className} Modal`} ref={this.refHandlers.main}>
        <ReactCSSTransitionGroup
          transitionName='anim'
          transitionAppear={this.props.transitionAppear}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeave={false}
        >
          <div className='Modal-backdrop' />
        </ReactCSSTransitionGroup>
        <div className='Modal-dialog' ref={this.refHandlers.dialog} style={dialogStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }

  private getCenteredDialogPos(): number {
    const parentHeight = window.innerHeight;
    const dialogHeight = this.props.height;

    return parentHeight / 2 - dialogHeight / 2;
  }
}
