/**
 * This class allows developers to get premade mock objects for classes.
 * Every mock class must have a base object (this.base) which has the
 * default values of all of an object's attributes. Developers can then add
 * customized mocks by creating new variables with any values they want to overwrite.
 * The syntax is simply Mock.get(), and customized attributes can be assigned through
 * string parameters.
 *
 * If the attribute is a function, it is passed the old value and must return a new one
 *
 * ```js
 *   class ExampleMock extends Mock {
 *     base = {
 *       id: '1',
 *       value: 'Test'
 *     }
 *
 *     modified = {
 *     value: 'Other'
 *     }
 *
 *     noValue(original) {
 *       return _.omit(original, 'value');
 *     }
 *   }
 *
 *   let mock = new ExampleMock();
 *
 *   mock.get() // => returns { id: '1', value: 'Test' }
 *   mock.get('modified') // => returns { id: '1', value: 'Other' }
 *   mock.get('noValue') // => returns { id: '1' }
 * ```
 *
 * @module Mocking
 */ /** for typedoc */

import * as cloneDeep from 'lodash.clonedeep';

export class Mock {
  public get<T>(this: any, ...modifiers: Array<any>): T {
    if (!this.base) throw new Error('Mocks require a base attribute / function');

    let obj = typeof this.base === 'function' ? this.base() : cloneDeep(this.base);

    modifiers.forEach((modifier) => {
      const value = this[modifier] || {};

      if (typeof value === 'function') {
        obj = value(obj);
      } else {
        Object.assign(obj, value);
      }
    });

    return obj;
  }
}
