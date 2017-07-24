import { WebViewLifeCycleBase, WebViewLifeCycleHandlerBase, webViewLifeCycle } from '../../epics/web-view-life-cycle';
import { WebViewContext } from './web-view-ctx';
import { webViewLifeCycleMixin } from './web-view-life-cycle-mixin';

/**
 * WebViewContext component with lifecycle event support via webViewLifeCycleMixin.
 */
export class WebViewLifeCycleComponent
  extends webViewLifeCycleMixin(WebViewContext, webViewLifeCycle as WebViewLifeCycleBase & WebViewLifeCycleHandlerBase) {
}