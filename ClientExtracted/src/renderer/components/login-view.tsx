/**
 * @module RendererComponents
 */ /** for typedoc */

import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { Component } from '../../lib/component';
import { eventStore, StoreEvent } from '../../stores/event-store';
import { FullScreenModal } from './full-screen-modal';
import { settingStore } from '../../stores/setting-store';
import { WebViewContext } from './web-view-ctx';
import { noop } from '../../utils/noop';

import * as React from 'react'; // tslint:disable-line:no-unused-variable

export interface LoginViewProps {
  cancelable: boolean;
  onCancel: () => void;
}

export interface LoginViewState {
  showBackButton: boolean;
  pageDidLoad: boolean;
  spinnerOpacity: number;
  slackUrl: string;
  mainWindowFocusedEvent: StoreEvent;
}

export class LoginView extends Component<LoginViewProps, Partial<LoginViewState>> {
  public static defaultProps: LoginViewProps = {
    cancelable: false,
    onCancel: () => {
      noop();
    }
  };

  private spinnerElement: HTMLImageElement;
  private modalElement: FullScreenModal;
  private webViewElement: WebViewContext;
  private readonly refHandlers = {
    spinner: (ref: HTMLImageElement) => this.spinnerElement = ref,
    modal: (ref: FullScreenModal) => this.modalElement = ref,
    webView: (ref: WebViewContext) => this.webViewElement = ref
  };

  private readonly eventHandlers = {
    onCancel: () => this.cancel(),
    onPageLoad: () => this.handlePageLoad()
  };

  constructor(props: LoginViewProps) {
    super(props);

    //todo: modifying state is not recommended and guarded by readonly, need to update logic
    (this.state as any).showBackButton = false;
    (this.state as any).pageDidLoad = false;
    (this.state as any).spinnerOpacity = 0;
  }

  public syncState(): Partial<LoginViewState> {
    return {
      slackUrl: settingStore.getSignInUrl(),
      mainWindowFocusedEvent: eventStore.getEvent('mainWindowFocused')
    };
  }

  public componentDidMount(): void {
    this.setState({ spinnerOpacity: 1 });
  }

  public mainWindowFocusedEvent(): void {
    if (this.webViewElement) {
      this.webViewElement.focus();
    }
  }

  public cancel(): void {
    this.modalElement.cancel();
  }

  public render(): JSX.Element | null {
    const overlay = this.state.pageDidLoad ? null : (
      <div className='LoginView-overlay'>
        <img
          className='LoginView-overlaySpinner'
          ref={this.refHandlers.spinner}
          srcSet='trying.webp 1x, trying@2x.webp 2x'
          style={{ opacity: this.state.spinnerOpacity }}
        />
      </div>
    );

    return (
      <FullScreenModal
        ref={this.refHandlers.modal}
        showCancel={this.props.cancelable}
        onCancel={this.props.onCancel}
      >

        <div className='LoginView'>
          <ReactCSSTransitionGroup
            transitionName='overlay'
            transitionEnter={false}
            transitionLeaveTimeout={300}
          >
            {overlay}
          </ReactCSSTransitionGroup>

          <WebViewContext
            className='webView'
            login={true}
            options={{ src: this.state.slackUrl! }}
            onPageLoad={this.eventHandlers.onPageLoad}
            onRequestClose={this.eventHandlers.onCancel}
            ref={this.refHandlers.webView}
            id='login'
          />
        </div>
      </FullScreenModal>
    );
  }

  private handlePageLoad(): void {
    this.setState({ pageDidLoad: true });
    this.webViewElement.focus();
  }
}
