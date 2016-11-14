import React from 'react';
import Component from '../../lib/component';

export default class NonDraggableRegion extends Component {
  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    top: React.PropTypes.number.isRequired,
    left: React.PropTypes.number.isRequired
  }
  render() {
    return (
      <div className='NonDraggableRegion' tabIndex='-1' style={{
        width: this.props.width,
        height: this.props.height,
        left: this.props.left,
        top: this.props.top
      }}>
      </div>
    );
  }
}
