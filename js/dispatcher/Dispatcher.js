var Promise = require('es6-promise').Promise
  , assign  = require('object-assign')
  ;

var _callbacks = []
  , _promises = []
  ;

var Dispatcher = function () {};

Dispatcher.prototype = assign( {}, Dispatcher.prototype, {
   /**
   * Register a Store's callback so that it may be invoked by an action.
   * @param {function} callback The callback to be registered.
   * @return {number} The index of the callback within the _callbacks array.
   */

  register: function register (callback) {
    _callbacks.push(callback);
    return _callbacks.length - 1;
  },

  /**
   * dispatch
   * @param  {object} payload The data from the action.
   */

  dispatch: function dispatch (payload) {
    var resolves = []
      , rejects = []
      ;

    // create array of promises for callbacks to reference
    _promises = _callbacks.map(function(_, i) {
      return new Promise(function(resolve, reject) {
        resolves[i] = resolve;
        rejects[i] = reject;
      });
    });

    // dispatch to callback and resolve/reject promises
    _callbacks.forEach(function(callback, i) {
      // callback can return an obj to resolve, or a promise to chain
      // see waitFor() for why this might be useful.
      Promise.resolve(callback(payload)).then(function() {
        resolves[i](payload);
      }, function() {
        rejects[i](new Error('Dispatcher callback unsuccessful'));
      });
    });
    _promises = [];
  }
})

module.exports = Dispatcher;
