import * as React from 'react'; // tslint:disable-line
import Component from '../../lib/component';

export interface TitleBarButtonsContainerProps {
  backgroundColor: string;
  blurRadius: number;
  isTitleBarHidden: boolean;
  hasOverflown: boolean;
  hasScrolled: boolean;
}

export interface TitleBarButtonsContainerState {
}

export class TitleBarButtonsContainer extends Component<TitleBarButtonsContainerProps, TitleBarButtonsContainerState> {
  private readonly height: number = 22;

  public render(): JSX.Element | null {
    const shouldHaveOverflowIndicator = this.props.hasOverflown && this.props.hasScrolled;
    const titleBarStyle = {
      position: 'absolute',
      width: '100%',
      backgroundColor: this.props.backgroundColor,
      transition: 'inherit',
      boxShadow: shouldHaveOverflowIndicator ? `0 10px ${this.props.blurRadius}px 0px ${this.props.backgroundColor}` : 'none',
      WebkitClipPath: `inset(0 ${this.props.blurRadius}px 0 0)`,
      zIndex: 1,
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
