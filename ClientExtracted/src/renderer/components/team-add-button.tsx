/**
 * @module RendererComponents
 */ /** for typedoc */

import * as React from 'react'; // tslint:disable-line:no-unused-variable

import { Component } from '../../lib/component';
import { intl as $intl, LOCALE_NAMESPACE } from '../../i18n/intl';

const ITEM_MARGIN_BETWEEN = 16;

export interface TeamAddButtonProps {
  style: React.CSSProperties;
  handleAddClick: React.EventHandler<React.MouseEvent<HTMLDivElement>>;
  dragInProgress: boolean;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
}

export interface TeamAddButtonState {
}

export class TeamAddButton extends Component<TeamAddButtonProps, TeamAddButtonState> {

  /* tslint:disable:jsx-no-multiline-js max-line-length */
  public render(): JSX.Element | null {
    return (
      <div
        className='TeamSidebar-addArea'
        style={{
          ...this.props.style,
          opacity: this.props.dragInProgress ? 0 : 1.0,
          backgroundColor: this.props.backgroundColor,
          paddingBottom: ITEM_MARGIN_BETWEEN
        }}
      >
        <div
          className='TeamSidebar-addButton'
          onClick={this.props.handleAddClick}
          title={$intl.t(`Sign in to another team…`, LOCALE_NAMESPACE.RENDERER)()}
          style={{
            backgroundColor: this.props.textColor,
            borderRadius: this.props.borderRadius
          }}
        >
          <svg
            width='18px'
            height='18px'
            viewBox='0 0 28 28'
            version='1.1'
            style={{
              fillRule: 'evenodd',
              clipRule: 'evenodd',
              strokeLinejoin: 'round',
              strokeMiterlimit: 1.41421
            }}
          >
            <g transform='matrix(1,0,0,1,-5.97974,3.5452)'>
              <path
                d='M21.992,8.503L31.953,8.503C32.539,8.503 33.027,8.691 33.418,9.069C33.809,9.447 34.004,9.922 34.004,10.495C34.004,11.068 33.809,11.549 33.418,11.94C33.027,12.331 32.539,12.52 31.953,12.507L21.992,12.507L21.992,22.467C21.992,23.053 21.803,23.542 21.426,23.932C21.048,24.323 20.573,24.518 20,24.518C19.427,24.518 18.952,24.323 18.574,23.932C18.197,23.542 18.008,23.053 18.008,22.467L18.008,12.507L8.047,12.507C7.461,12.507 6.973,12.318 6.582,11.94C6.191,11.549 5.996,11.068 5.996,10.495C5.996,9.922 6.191,9.447 6.582,9.069C6.973,8.691 7.461,8.503 8.047,8.503L18.008,8.503L18.008,-1.458C18.008,-2.044 18.197,-2.533 18.574,-2.923C18.952,-3.301 19.427,-3.49 20,-3.49C20.573,-3.49 21.048,-3.294 21.426,-2.904C21.803,-2.513 21.992,-2.031 21.992,-1.458L21.992,8.503Z'
                style={{
                  fill: this.props.backgroundColor,
                  fillRule: 'nonzero'
                }}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }
  /* tslint:enable:no-multiline-jsx max-line-length */
}
