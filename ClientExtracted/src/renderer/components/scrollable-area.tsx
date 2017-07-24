/**
 * @module RendererComponents
 */ /** for typedoc */

import * as classNames from 'classnames';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { Component } from '../../lib/component';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export type scrollbarType = 'default' | 'custom' | 'none';

export interface ScrollableAreaProps {
  style: any;
  scrollbar: scrollbarType;
  maxScroll?: number;
}

export class ScrollableArea extends Component<ScrollableAreaProps> {
  public static readonly defaultProps: ScrollableAreaProps = {
    style: {},
    scrollbar: 'default',
    maxScroll: NaN
  };

  private scrollableElement: HTMLElement;
  private readonly refHandlers = {
    scrollable: (ref: HTMLElement) => this.scrollableElement = ref
  };

  private readonly eventHandlers = {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => this.handleScroll(e)
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
          onScroll={this.eventHandlers.onScroll}
        >
          {this.props.children}
        </div>
      </div>
    );
  }

  private handleScroll(e: React.UIEvent<HTMLDivElement>): void {
    const scrollable = this.scrollableElement;
    const maxScroll = this.props.maxScroll;
    if (!maxScroll || isNaN(maxScroll)) {
      return;
    }

    const maxScrollTop = maxScroll - scrollable.clientHeight;
    if (this.props.maxScroll && scrollable.scrollTop >= maxScrollTop) {
      scrollable.scrollTop = maxScrollTop;
      e.preventDefault();
    }
  }
}
