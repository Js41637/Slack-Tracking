import {Component} from '../../lib/component';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface TitleBarButtonsContainerProps {
  backgroundColor: string;
  isTitleBarHidden: boolean;
  zIndex: number;
}

export interface TitleBarButtonsContainerState {
}

export class TitleBarButtonsContainer extends Component<TitleBarButtonsContainerProps, TitleBarButtonsContainerState> {
  private readonly height: number = 22;

  public render(): JSX.Element | null {
    const titleBarStyle = {
      position: 'absolute',
      width: '100%',
      backgroundColor: this.props.backgroundColor,
      transition: 'inherit',
      zIndex: this.props.zIndex,
      top: this.props.isTitleBarHidden ? 0 : -this.height,
      height: this.height
    };

    return (
      <div
        className='StoplightContainer'
        style={titleBarStyle}
      />
    );
  }
}
