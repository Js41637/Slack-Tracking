import * as classNames from 'classnames';
import Component from '../lib/component';

import * as React from 'react'; // tslint:disable-line

/**
 * Should match `transition_duration` in full-screen-modal.less
 */
const TRANSITION_DURATION = 250;

export interface FullScreenModalProps {
  headerText: string;
  compactHeader: boolean;
  showBack: boolean;
  showCancel: boolean;
  onBack: (() => void) | null;
  onCancel: (() => void) | null;
}

export interface FullScreenModalState {
  isActive: boolean;
}

/**
 * This is a full-screen modal component that matches the implementation in the
 * webapp. Refer to TS.ui.fs_modal.source.js.
 *
 * Naming conventions have been left in place to ease replacement or porting
 * modifications.
 */
export class FullScreenModal extends Component<FullScreenModalProps, FullScreenModalState> {
  public static readonly defaultProps: FullScreenModalProps = {
    headerText: '',
    compactHeader: true,
    showBack: false,
    showCancel: false,
    onBack: null,
    onCancel: null
  };

  private readonly eventHandlers = {
    onCancel: () => this.cancel()
  };

  public componentDidMount(): void {
    this.setState({isActive: true});
  }

  /**
   * Animate the dialog out, then call the action that will unmount it.
   */
  public cancel(): void {
    this.setState({isActive: false});
    setTimeout(this.props.onCancel, TRANSITION_DURATION);
  }

  public render(): JSX.Element | null {
    const {headerText, compactHeader, showBack, showCancel, onBack} = this.props;

    const classes = {
      active: this.state.isActive,
      fs_modal_header: compactHeader
    };

    const header = !compactHeader && headerText && headerText.length > 0 ? (
      <div id='fs_modal_header'>
        <h3>{headerText}</h3>
      </div>
    ) : null;

    const backButton = !showBack ? null : (
      <a id='fs_modal_back_btn' className='fs_modal_btn hidden' onClick={onBack!}>
        <i className='ts_icon ts_icon_arrow_large_left' />
        <span className='key_label'>back</span>
      </a>
    );

    const cancelButton = !showCancel ? null : (
      <a id='fs_modal_close_btn' className='fs_modal_btn' onClick={this.eventHandlers.onCancel}>
        <i className='ts_icon ts_icon_times' />
        <span className='key_label'>esc</span>
      </a>
    );

    return (
      <div className='full-screen-modal-container'>
        <div id='fs_modal_bg' className={classNames('fs_modal_bg', classes)} />
        <div id='fs_modal' className={classNames('fs_modal', classes)}>

          {backButton}
          {cancelButton}
          {header}

          <div className='contents_container'>
             <div className='contents'>
               {this.props.children}
             </div>
          </div>
        </div>
      </div>
    );
  }
}
