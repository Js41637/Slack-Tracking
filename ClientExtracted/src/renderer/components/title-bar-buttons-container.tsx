/**
 * @module RendererComponents
 */ /** for typedoc */

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface TitleBarButtonsContainerProps {
  backgroundColor: string;
  isTitleBarHidden: boolean;
  zIndex: number;
}

export function TitleBarButtonsContainer(props: TitleBarButtonsContainerProps): JSX.Element {
  const height: number = 22;
  const { backgroundColor, zIndex } = props;

  const titleBarStyle = {
    position: 'absolute',
    width: '100%',
    backgroundColor,
    transition: 'inherit',
    zIndex,
    top: props.isTitleBarHidden ? 0 : -height,
    height
  };

  return (<div className='StoplightContainer' style={titleBarStyle} />);
}
