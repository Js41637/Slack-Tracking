/**
 * @module RendererComponents
 */ /** for typedoc */

import * as React from 'react'; // tslint:disable-line

//TODO: prop children property might need revisit via https://github.com/Microsoft/TypeScript/issues/13618
export interface DraggableRegionProps {
  height: number;
  children?: JSX.Element;
}

export const DraggableRegion = (props: DraggableRegionProps) => (
  <div
    className='DraggableRegion'
    tabIndex={-1}
    style={{ height: props.height }}
  >
    {props.children}
  </div>
);