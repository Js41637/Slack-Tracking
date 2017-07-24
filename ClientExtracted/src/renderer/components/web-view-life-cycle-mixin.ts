import { WebViewLifeCycleBase, WebViewLifeCycleHandlerBase } from '../../epics/web-view-life-cycle';
import { Store } from '../../lib/store';
import { logger } from '../../logger';
import '../../rx-operators';
import { WEBVIEW_LIFECYCLE, webViewLifeCycleType } from '../../utils/shared-constants';
import { WebViewContext } from './web-view-ctx';

type mixinConstructor<T> = new (...args: Array<any>) => T;

/**
 * Defines list of lifecycle events to dispatch into the store. It's not
 * necessary to dispatch all events, as that will create an IPC burden.
 */
const dispatchableLifeCycleEvent: Readonly<Array<webViewLifeCycleType>> = [
  WEBVIEW_LIFECYCLE.PAGE_LOADED,
  WEBVIEW_LIFECYCLE.WEBAPP_LOADED
];

/**
 * Mixin definition wraps a `WebViewContext`, registering component's status
 * into current process's WebViewState object and broadcasting status changes.
 */
const webViewLifeCycleMixin =
  <T extends mixinConstructor<WebViewContext>>(Base: T, state: WebViewLifeCycleBase & WebViewLifeCycleHandlerBase) =>
    class extends Base {
      public componentDidMount(): void {
        super.componentDidMount();

        const id = this.props.id;
        if (!id) {
          logger.error(`WebView LifeCycle Mixin: WebView component does not have ID, cannot assign in storage`);
          return;
        }

        state.registerComponent(id);

        // Allows epics to react to specific lifecycle events of webapp;
        // instead of creating an action for each, we'll just dispatch the lifecycle stage.
        state.get(id)
          .filter((x) => dispatchableLifeCycleEvent.includes(x.type))
          .map((x) => ({ ...x, id }))
          .subscribe(Store.dispatch.bind(Store));

        const componentState = state.getState(id);
        logger.info('WebView LifeCycle: New webview component created for ' +
          `${id}:${state.getComponentId(id)}', with state '${componentState.type}'`);
      }

      public componentWillUnmount(): void {
        const id = this.props.id;
        if (!!id) {
          state.setState(id, { type: WEBVIEW_LIFECYCLE.COMPONENT_DISPOSED });
          state.remove(id);
        } else {
          logger.error(`WebView LifeCycle Mixin: WebView component does not have ID, cannot remove from storage`);
        }

        super.componentWillUnmount();
      }
    };

export {
  dispatchableLifeCycleEvent,
  webViewLifeCycleMixin
};
