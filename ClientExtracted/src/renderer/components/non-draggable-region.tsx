/**
 * @module RendererComponents
 */ /** for typedoc */

import { Region } from '../../utils/shared-constants';
import { Component } from '../../lib/component';

import * as React from 'react'; // tslint:disable-line

export interface NonDraggableRegionProps extends Region {
}

export interface NonDraggableRegionState {
}

export class NonDraggableRegion extends Component<NonDraggableRegionProps, NonDraggableRegionState> {
  public render(): JSX.Element | null {
    return (
      <div
        className='NonDraggableRegion'
        tabIndex={-1}
        style={{ width: this.props.width, height: this.props.height, left: this.props.left, top: this.props.top }}
      />
    );
  }
}
