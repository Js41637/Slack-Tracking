import {Subscription} from 'rxjs/Subscription';

//taking different approach to window-behavior uses abstract class for base class extend
export interface WebViewBehavior {
  setup(webView: Electron.WebContents | Electron.WebViewElement): Subscription;
}
