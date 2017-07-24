/**
 * @module RendererBehaviors
 */ /** for typedoc */

import { Subscription } from 'rxjs/Subscription';

export interface Behavior<T> {
  setup(target: T): Subscription;
}
