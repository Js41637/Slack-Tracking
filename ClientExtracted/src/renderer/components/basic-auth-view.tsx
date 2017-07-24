/**
 * @module RendererComponents
 */ /** for typedoc */

import { dialogActions } from '../../actions/dialog-actions';
import { Component } from '../../lib/component';
import { dialogStore } from '../../stores/dialog-store';
import { Modal } from './modal';

import { LOCALE_NAMESPACE, intl as $intl } from '../../i18n/intl';

import * as React from 'react'; // tslint:disable-line

export interface BasicAuthViewProps {
  authInfo: Electron.AuthInfo;
}

export interface BasicAuthViewState {
  username: string | null;
  password: string | null;
}

export class BasicAuthView extends Component<BasicAuthViewProps, Partial<BasicAuthViewState>> {
  private usernameElement: HTMLElement;
  private passwordElement: HTMLElement;
  private readonly refHandlers = {
    username: (ref: HTMLElement) => this.usernameElement = ref,
    password: (ref: HTMLElement) => this.passwordElement = ref
  };

  private readonly eventHandlers = {
    onSubmit: () => this.handleSubmit(),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => this.handleChange(e),
  };

  constructor() {
    super();

    //TODO: revise to avoid direct state assignment required.
    this.state = {
      ...this.state,
      ...(dialogStore.getAuthCredentials() || { username: null, password: null })
    };
  }

  public handleSubmit(): void {
    dialogActions.submitCredentials({
      username: this.state.username!,
      password: this.state.password!
    });
  }

  public componentDidMount(): void {
    this.usernameElement.focus();
  }

  public render(): JSX.Element | null {
    const { isProxy, host } = this.props.authInfo;
    const message = isProxy ? $intl.t('To connect to Slack, you need to enter a username and password for the proxy ', LOCALE_NAMESPACE.RENDERER)()
      : $intl.t('To connect to Slack, you need to enter a username and password for the server ', LOCALE_NAMESPACE.RENDERER)();

    //TODO: `state.username` and `state.password` can be `null`, able to lead into react warning. Consider refactoring interfaces.
    return (
      <Modal
        className='AuthView'
        width={360}
        height={340}
        transitionAppear={true}
      >
        <div className='AuthView-dialog' style={{ height: '100%', backgroundColor: 'white' }}>
          <div className='AuthView-message'>
            {message}
            <strong>{host}</strong>
          </div>
          <form onSubmit={this.eventHandlers.onSubmit}>
            <label htmlFor='username'>{$intl.t('Username', LOCALE_NAMESPACE.GENERAL)()}</label>
            <input type='text' id='username' value={this.state.username!} onChange={this.eventHandlers.onChange} ref={this.refHandlers.username} />
            <label htmlFor='password'>{$intl.t('Password', LOCALE_NAMESPACE.GENERAL)()}</label>
            <input
              type='password'
              id='password'
              value={this.state.password!}
              onChange={this.eventHandlers.onChange}
              ref={this.refHandlers.password}
            />
            <button type='submit' className='AuthView-button'>{$intl.t('Submit', LOCALE_NAMESPACE.GENERAL)()}</button>
          </form>
        </div>
      </Modal>
    );
  }

  private handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      [(event.target as any).id]: (event.target as any).value
    });
  }
}
