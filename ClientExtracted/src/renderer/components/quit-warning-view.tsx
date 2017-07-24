import { Component } from '../../lib/component';
import { Modal } from './modal';

import * as React from 'react'; // tslint:disable-line

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';
export interface QuitWarningViewProps {
  shortcut?: string;
}

export class QuitWarningView extends Component<QuitWarningViewProps> {
  public render(): JSX.Element {
    return (
      <Modal
        className={'QuitWarningView'}
        width={400}
        height={80}
        transitionAppear={true}
      >
        <div className='QuitWarningView-dialog'>
          {$intl.t(`Hold ${this.props.shortcut} to Quit Slack`, LOCALE_NAMESPACE.RENDERER)()}
        </div>
      </Modal>
    );
  }
}
