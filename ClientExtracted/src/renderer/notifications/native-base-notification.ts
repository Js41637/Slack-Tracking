/**
 * @module Notifications
 */ /** for typedoc */

import * as EventEmitter from 'events';

interface NotificationBaseEvents {
  on(event: 'click', listener: (event: MouseEvent) => void): this;
  on(event: 'close', listener: (event: CloseEvent) => void): this;
  on(event: 'reply', listener: (result: { response: string }) => void): this;
  on(event: 'error', listener: (error: Error) => void): this;
}

export abstract class NotificationBase extends EventEmitter implements NotificationBaseEvents {
  constructor() {
    super();
  }

  public abstract close(): void;
}
