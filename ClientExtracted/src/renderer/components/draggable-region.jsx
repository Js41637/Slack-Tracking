import React from 'react';
import Component from '../../lib/component';

export default class DraggableRegion extends Component {
  static propTypes = {
    height: React.PropTypes.number.isRequired
  }

  render() {
    return(
      <div className='DraggableRegion' tabIndex='-1' style={{
        height: this.props.height
      }}>
        {this.props.children}
      </div>
    );
  }
}
