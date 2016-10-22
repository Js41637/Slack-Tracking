import React from 'react';
import Component from '../../lib/component';

export default class TitleBarButtonsContainer extends Component {
  static propTypes = {
    backgroundColor: React.PropTypes.string.isRequired,
    blurRadius: React.PropTypes.number.isRequired,
    isTitleBarHidden: React.PropTypes.bool.isRequired,
    hasOverflown: React.PropTypes.bool.isRequired,
    hasScrolled: React.PropTypes.bool.isRequired
  };

  render() {
    let height = 22;
    let shouldHaveOverflowIndicator = this.props.hasOverflown && this.props.hasScrolled;

    return (
      <div className='StoplightContainer' style={{
        position: 'absolute',
        width: '100%',
        backgroundColor: this.props.backgroundColor,
        transition: 'inherit',
        boxShadow: shouldHaveOverflowIndicator ? `0 10px ${this.props.blurRadius}px 0px ${this.props.backgroundColor}` : 'none',
        WebkitClipPath: `inset(0 ${this.props.blurRadius}px 0 0)`,
        zIndex: 1,
        top: this.props.isTitleBarHidden ? 0 : -height,
        height: height
      }}/>
    );
  }
}
