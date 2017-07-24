/**
 * This module represents code that the webapp ships in the Desktop app -
 * this code can include whatever we want and will be exposed as an instantiated
 * class in the webapp, under `window.slack_core`.
 *
 * There are a few important things to note about this module:
 *
 * 1. Don't be afraid of the import/export syntax or the class syntax! It's
 *    not so different from declaring a module the TS way at the end of the
 *    day. Come fetch us and we can help out.
 *
 * 2. Even if your method just returns a string / number / whatever, when you
 *    call it in the webapp, it will _always_ return a Promise (if your method
 *    already returns a Promise, it'll automatically be "Deduped").
 *
 * 3. You can _only_ access methods from the webapp, you can't get or set
 *    property values. You _can_ just write a method to get or set that property
 *    on the class though!
 *
 *    This caveat doesn't apply to submodules though, only properties - i.e.
 *    `window.slackCore.coolClass.callAMethod()` still works.
 *
 * 4. The parameters and return value of all of these methods have to be
 *    JSON-serializable - this means, you can't pass in a Function or a Class,
 *    or return a Function or Class (note that Promises themselves are a
 *    Special Snowflake in this regard).
 *
 * 5. Currently, this module has node integration enabled - this means, that all
 *    code in this module has full Desktop Powers(tm).
 *
 * If any of these caveats truly are tripping you up, come talk to us and we
 * can work out a solution
 *
 * @module WebappShared
 */ /** for typedoc */
export class WebappSharedMainModule {
  constructor() {
    // This is a good place to instantiate another module if we write it:
  }
}
