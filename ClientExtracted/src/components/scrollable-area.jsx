import React from 'react';
import classNames from 'classnames';
import {Observable} from 'rx';
import Component from '../lib/component';

export default class ScrollableArea extends Component {

  static defaultProps = {
    style: {},
    scrollbar: 'default',
    maxScroll: null
  };

  static propTypes = {
    style: React.PropTypes.object,
    scrollbar: React.PropTypes.oneOf(['default', 'custom', 'none']),
    maxScroll: React.PropTypes.number
  };

  getScrollTop() {
    return this.refs.scrollable.scrollTop;
  }

  handleScroll(e) {
    let scrollable = this.refs.scrollable;
    let maxScrollTop = this.props.maxScroll - scrollable.clientHeight;
    if (this.props.maxScroll && scrollable.scrollTop >= maxScrollTop) {
      scrollable.scrollTop = maxScrollTop;
      e.preventDefault();
    }
  }

  observeScroll() {
    return Observable.fromEvent(this.refs.scrollable, 'scroll');
  }

  render() {

    let containerClassNames = classNames(
      "ScrollableArea-container",
      `ScrollableArea-scrollbar-${this.props.scrollbar}`
    );

    return (
      <div className="ScrollableArea" style={this.props.style}>
        <div
          ref="scrollable"
          className={containerClassNames}
          onScroll={this.handleScroll.bind(this)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
