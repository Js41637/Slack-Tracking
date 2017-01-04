//Inherited class of base-store have usage of rest property which TS@2 does not
//support yet, bypass via ambient module declaration
import {Action} from '../actions/action';
import {Unsubscribe, Store, Reducer} from 'redux';

export abstract class BaseStore<T> implements Store<T> {
  protected store: BaseStore<T> | null;
  protected readonly postDispatchCallback: (action: Action) => void;

  public getState(): T | any;
  public subscribe(listener: () => void): Unsubscribe;
  public dispatch<S extends Action>(action: S): S;
  public replaceReducer(nextReducer: Reducer<T>): void;
  protected getStore(): this;
  protected subscribePostDispatch(listener: <T>(action: T) => void): Unsubscribe;
  protected getWebViewShape(): any;
  protected logDispatches(): any;
}
