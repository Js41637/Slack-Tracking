import * as classNames from 'classnames';
import {Observable} from 'rxjs/Observable';
import Component from '../lib/component';
import 'rxjs/add/observable/fromEvent';

import * as React from 'react'; // tslint:disable-line

export type scrollbarType = 'default' | 'custom' | 'none';

export interface ScrollableAreaProps {
  style: any;
  scrollbar: scrollbarType;
  maxScroll: number;
}

export interface ScrollableAreaState { }

export class ScrollableArea extends Component<ScrollableAreaProps, ScrollableAreaState> {
  public static readonly defaultProps: ScrollableAreaProps = {
    style: {},
    scrollbar: 'default',
    maxScroll: NaN
  };

  private scrollableElement: HTMLElement;
  private readonly refHandlers = {
    scrollable: (ref: HTMLElement) => this.scrollableElement = ref
  };

  public get ScrollTop(): number {
    return this.scrollableElement.scrollTop;
  }

  public observeScroll(): Observable<Event> {
    return Observable.fromEvent(this.scrollableElement, 'scroll');
  }

  public render(): JSX.Element | null {
    const containerClassNames = classNames(
      'ScrollableArea-container',
      `ScrollableArea-scrollbar-${this.props.scrollbar}`
    );

    return (
      <div className='ScrollableArea' style={this.props.style}>
        <div
          ref={this.refHandlers.scrollable}
          className={containerClassNames}
          onScroll={this.handleScroll.bind(this)}
        >
          {this.props.children}
        </div>
      </div>
    );
  }

  private handleScroll(e: Event): void {
    const scrollable = this.scrollableElement;
    const maxScrollTop = this.props.maxScroll - scrollable.clientHeight;
    if (this.props.maxScroll && scrollable.scrollTop >= maxScrollTop) {
      scrollable.scrollTop = maxScrollTop;
      e.preventDefault();
    }
  }
}
