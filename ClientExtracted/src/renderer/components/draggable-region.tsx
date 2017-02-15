import {Component} from '../../lib/component';

import * as React from 'react'; // tslint:disable-line

export interface DraggableRegionProps {
  height: number;
}

export interface DraggableRegionState {
}

export class DraggableRegion extends Component<DraggableRegionProps, DraggableRegionState> {
  public render(): JSX.Element | null {
    return(
      <div
        className='DraggableRegion'
        tabIndex={-1}
        style={{height: this.props.height}}
      >
        {this.props.children}
      </div>
    );
  }
}
