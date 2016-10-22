import {Subject, Disposable} from 'rx';
import logger from './logger';

export default class CopSubject extends Subject {
  constructor() {
    super();
    
    try {
      throw new Error();
    } catch (e) {
      this.ctorStack = e;
    }
  }
  
  subscribe(obs) {
    this.subscribeCount = this.subscribeCount || 0;
    
    let d = super.subscribe(obs);
    this.subscribeCount++;
    
    if (this.subscribeCount > 3) {
      try {
        throw new Error();
      } catch (e) {
        logger.error(`Too many subscribers (${this.subscriberCount}) to Subject!\n\nSubscribe stack:\n${e.stack}\n\nCreated at:\n\n${this.ctorStack.stack}`);
      }
    }
    
    return Disposable.create(() => {
      d.dispose();
      this.subscribeCount--;
    });
  }
}
