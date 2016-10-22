import React from 'react';
import Component from '../../lib/component';

export default class NonDraggableRegion extends Component {
  static propTypes = {
    width: React.PropTypes.number.isRequired,
    right: React.PropTypes.number.isRequired
  }
  render() {
    return (
      <div className='NonDraggableRegion' tabIndex='-1' style={{
        width: this.props.width,
        right: this.props.right
      }}>
      </div>
    );
  }
}
