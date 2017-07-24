/**
 * @module RendererComponents
 */ /** for typedoc */

import { Region } from '../../utils/shared-constants';
import * as React from 'react'; // tslint:disable-line

export const NonDraggableRegion = (props: Region) => (<div className='NonDraggableRegion' tabIndex={-1} style={{ ...props }} />);
