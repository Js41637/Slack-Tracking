import _ from 'lodash';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import rx from 'rx-dom';

import Component from '../lib/component';

export default class Modal extends Component {

  static defaultProps = {
    width: 790,
    height: 660,
    onRequestClose: () => {},
    className: '',
    transitionAppear: false
  };

  static propTypes = {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    flexSize: React.PropTypes.bool, // Whether the modal resizes itself on window shrink
    onRequestClose: React.PropTypes.func,
    className: React.PropTypes.string,
    transitionAppear: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
  }

  // Initializes the repositioning logic to animate the window centering itself
  componentDidMount() {
    // getBoundingClientRect() doesn't work at first, needs a requestAnimationFrame
    requestAnimationFrame(() => {
      this.setState({ styleOverride: {
        top: this.getCenteredDialogPos(),
        transition: 'all 0.5s ease-out'
      }});
    });

    // Reposition the window on window resize
    this.disposables.add(rx.DOM.fromEvent(window, 'resize').subscribe(() => {
      this.setState({styleOverride: {
        top: this.getCenteredDialogPos(),
        transition: 'none'
      }});
    }));
  }

  getCenteredDialogPos() {
    let parentHeight = window.innerHeight;
    let dialogHeight = this.props.height;

    return parentHeight / 2 - dialogHeight / 2;
  }

  render() {
    let dialogStyle = {
      width: this.props.width,
      height: this.props.height,
      top: '-100%'
    };

    _.extend(dialogStyle, this.state.styleOverride); // Used for animations

    return (
      <div className={`${this.props.className} Modal`} ref="main">
        <ReactCSSTransitionGroup
          transitionName="anim"
          transitionAppear={this.props.transitionAppear}
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeave={false}>
          <div className="Modal-backdrop" />
        </ReactCSSTransitionGroup>
        <div className="Modal-dialog" ref="dialog" style={dialogStyle}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
