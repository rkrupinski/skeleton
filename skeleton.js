(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.$ = factory();
  }
}(this, function () {
  'use strict';

  var utils = {

    parseDOM: (function () {
      var container = document.createElement('div');

      return function (str) {
        container.innerHTML = str;
        return container.children;
      };
    }()),

    toArray: function (obj) {
      return Array.prototype.slice.call(obj);
    },

    isNaN: function (arg) {
      return arg !== arg;
    }

  };

  var mixin = {

  };

  var proto = {

    each: function (fn) {
      this._content.forEach(function (element, index) {
        fn.call(element, index, element);
      });

      return this;
    },

    get: function (index) {
      return typeof index === 'number' && !utils.isNaN(index) ?
          this._content[index] : this._content;
    }

  };


  function wrapper(arg, ctx) {
    var obj = Object.create(proto)
      , context = ctx || document
      , query = []
      , nodes = [];

    obj._content = [];

    switch (true) {
      case (typeof arg === 'string'):
        try {
          query = context.querySelectorAll(arg);
        } catch (e) {}

        nodes = utils.parseDOM(arg);

        switch (true) {
          case (!!query.length):
            // valid selector
            obj._content = utils.toArray(query);
            break;
          case (!!nodes.length):
            // element nodes found
            obj._content = utils.toArray(nodes);
            break;
          default:
            // neither
            break;
        }

        break;
      case (arg instanceof NodeList):
        // nodelist passed
        obj._content = utils.toArray(arg);
        break;
      case (arg instanceof Element):
        // element passed
        obj._content.push(arg);
        break;
      case (arg === document || arg === window):
        // document or window passed
        obj._content.push(arg);
        break;
      case (proto.isPrototypeOf(arg)):
        // wrapped
        obj._content = arg.get();
        break;
      case (Array.isArray(arg)):
        // array of whatever passed
        obj._content = arg;
        break;
      default:
        // neither
        break;
    }

    obj.context = context;
    obj.length = obj._content.length;

    return obj;
  }

  wrapper.fn = proto;

  Object.keys(mixin).forEach(function (prop) {
    wrapper[prop] = mixin[prop];
  });

  return wrapper;
}));
