// Public: This mixin implements DOM-style event listeners. Use with:
//
//_.extend(this, require('event-listener'))
module.exports = {
  // Public: An implementation of addEventListener, follows HTML5 spec
  addEventListener: function(type, listener) {
    this.listeners = this.listeners || {};
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(listener);

    if (!this.replayValues || this.replayValues[type]) return;
    listener(...this.replayValues[type]);
  },

  // Public: An implementation of removeEventListener, follows HTML5 spec
  removeEventListener: function(type, listener) {
    if (!this.listeners) return;
    if (!this.listeners[type]) return;

    let index = this.listeners[type].indexOf(listener);
    if (index < 0) return;

    if (this.listeners[type].length < 2) {
      this.listeners[type] = [];
      return;
    }

    this.listeners[type].splice(index, 1);
  },

  // Internal: Call this method to dispatch an event to any listeners who are
  // interested in said event.
  //
  // type - the type of event to send as a {String}
  // args - arguments to be sent to listeners
  //
  // Returns nothing
  dispatchEvent: function(type, ...args) {
    if (!this.listeners) return;
    if (!this.listeners[type]) return;

    let toDispatch = this.listeners[type];
    for (let i=0; i < toDispatch.length; i++) {
      toDispatch[i](...args);
    }
  },

  // Internal: Call this method to dispatch an event to any listeners who are
  // interested in said event. Future subscribers to this event who "miss the
  // boat" will get the last value played back to them.
  //
  // type - the type of event to send as a {String}
  // args - arguments to be sent to listeners
  //
  // Returns nothing
  dispatchEventWithReplay: function(type, ...args) {
    this.replayValues = this.replayValues || {};
    this.replayValues[type] = args;

    this.dispatchEvent(type, ...args);
  },

  // Internal: Drop all listeners. Use this to prevent memory leaks once an
  // object is "Done" / "Disposed"
  //
  // Returns nothing
  clearListeners: function() {
    this.listeners = {};
    this.replayValues = {};
  }
};
