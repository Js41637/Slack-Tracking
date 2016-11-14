import React from 'react';
import Component from '../../lib/component';

export default class TeamAddButton extends Component {
  static propTypes = {
    handleAddClick: React.PropTypes.func.isRequired,
    backgroundColor: React.PropTypes.string.isRequired,
    textColor: React.PropTypes.string.isRequired,
    itemMarginBetween: React.PropTypes.number.isRequired,
    overflowBlurRadius: React.PropTypes.number.isRequired,
    sizeOfList: React.PropTypes.number.isRequired,
    teamsByIndex: React.PropTypes.array.isRequired,
    hasOverflown: React.PropTypes.bool.isRequired,
    dragInProgress: React.PropTypes.bool.isRequired,
    borderRadius: React.PropTypes.number.isRequired
  }

  render() {
    return (
      <div className="TeamSelector-addArea" ref="addTeamBtn" style={{
        top: this.props.hasOverflown ? 'auto' : this.props.sizeOfList,
        opacity: this.props.dragInProgress ? 0 : 1.0,
        bottom: this.props.hasOverflown ? 0 : 'auto',
        paddingTop: this.props.hasOverflown ? this.props.itemMarginBetween - 10 : 'unset',
        paddingBottom: this.props.itemMarginBetween,
        backgroundColor: this.props.backgroundColor,
        boxShadow: this.props.hasOverflown ? `0 -10px ${this.props.overflowBlurRadius}px 0px ${this.props.backgroundColor}` : 'none',
        WebkitClipPath: this.props.hasOverflown ? `inset(0 ${this.props.overflowBlurRadius}px 0 0)` : 'none'
      }}>
        <div className="TeamSelector-addButton" onClick={this.props.handleAddClick} title="Sign in to another team…" style={{
          backgroundColor: this.props.textColor,
          visibility: (this.props.teamsByIndex.length > 0 ? 'visible' : 'hidden'),
          borderRadius: this.props.borderRadius
        }}>
          <svg width="18px" height="18px" viewBox="0 0 28 28" version="1.1" style={{
            fillRule: 'evenodd',
            clipRule: 'evenodd',
            strokeLinejoin: 'round',
            strokeMiterlimit: 1.41421
          }}>
            <g transform="matrix(1,0,0,1,-5.97974,3.5452)">
              <path
                d="M21.992,8.503L31.953,8.503C32.539,8.503 33.027,8.691 33.418,9.069C33.809,9.447 34.004,9.922 34.004,10.495C34.004,11.068 33.809,11.549 33.418,11.94C33.027,12.331 32.539,12.52 31.953,12.507L21.992,12.507L21.992,22.467C21.992,23.053 21.803,23.542 21.426,23.932C21.048,24.323 20.573,24.518 20,24.518C19.427,24.518 18.952,24.323 18.574,23.932C18.197,23.542 18.008,23.053 18.008,22.467L18.008,12.507L8.047,12.507C7.461,12.507 6.973,12.318 6.582,11.94C6.191,11.549 5.996,11.068 5.996,10.495C5.996,9.922 6.191,9.447 6.582,9.069C6.973,8.691 7.461,8.503 8.047,8.503L18.008,8.503L18.008,-1.458C18.008,-2.044 18.197,-2.533 18.574,-2.923C18.952,-3.301 19.427,-3.49 20,-3.49C20.573,-3.49 21.048,-3.294 21.426,-2.904C21.803,-2.513 21.992,-2.031 21.992,-1.458L21.992,8.503Z"
                style={{
                  fill: this.props.backgroundColor,
                  fillRule: 'nonzero'
                }} />
            </g>
          </svg>
        </div>
      </div>
    );
  }
}
