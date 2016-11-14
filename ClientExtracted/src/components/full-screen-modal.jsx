import classNames from 'classnames';
import React from 'react';

import Component from '../lib/component';

/**
 * Should match `transition_duration` in full-screen-modal.less
 */
const TRANSITION_DURATION = 250;

/**
 * This is a full-screen modal component that matches the implementation in the
 * webapp. Refer to TS.ui.fs_modal.source.js.
 *
 * Naming conventions have been left in place to ease replacement or porting
 * modifications.
 */
export default class FullScreenModal extends Component {

  static defaultProps = {
    headerText: '',
    compactHeader: true,
    showBack: false,
    showCancel: false,
    onBack: null,
    onCancel: null
  };

  static propTypes = {
    headerText: React.PropTypes.string,
    compactHeader: React.PropTypes.bool,
    showBack: React.PropTypes.bool,
    showCancel: React.PropTypes.bool,
    onBack: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };

  componentDidMount() {
    this.setState({isActive: true});
  }

  /**
   * Animate the dialog out, then call the action that will unmount it.
   */
  cancel() {
    this.setState({isActive: false});
    setTimeout(this.props.onCancel, TRANSITION_DURATION);
  }

  render() {
    let {headerText, compactHeader, showBack, showCancel, onBack} = this.props;

    let classes = {
      active: this.state.isActive,
      fs_modal_header: compactHeader
    };

    let header = !compactHeader && headerText && headerText.length > 0 ? (
      <div id="fs_modal_header">
        <h3>{headerText}</h3>
      </div>
    ) : null;

    let backButton = !showBack ? null : (
      <a id="fs_modal_back_btn" className="fs_modal_btn hidden" onClick={onBack}>
        <i className="ts_icon ts_icon_arrow_large_left"></i>
        <span className="key_label">back</span>
      </a>
    );

    let cancelButton = !showCancel ? null : (
      <a id="fs_modal_close_btn" className="fs_modal_btn" onClick={() => this.cancel()}>
        <i className="ts_icon ts_icon_times"></i>
        <span className="key_label">esc</span>
      </a>
    );

    return (
      <div>
        <div id="fs_modal_bg" className={classNames("fs_modal_bg", classes)}></div>
        <div id="fs_modal" className={classNames("fs_modal", classes)}>

          {backButton}
          {cancelButton}
          {header}

          <div className="contents_container">
             <div className="contents">
               {this.props.children}
             </div>
          </div>
        </div>
      </div>
    );
  }
}
