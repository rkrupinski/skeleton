(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.$ = factory();
  }
}(this, function () {
  'use strict';

  var slice = Array.prototype.slice;

  var mixin = {

    parseHTML: function (str) {
      var doc = document.implementation.createHTMLDocument('');

      doc.body.innerHTML = str;
      return slice.call(doc.body.children);
    }

  };

  var proto = {

    each: function (fn) {
      this._content.forEach(function (element, index) {
        fn.call(element, index, element);
      });

      return this;
    },

    get: function (index) {
      return typeof index === 'undefined' ? this._content :
          this._content[index < 0 ? this.length + index : index];
    },

    eq: function (index) {
      return wrapper(this.get(typeof index === 'undefined' ?
          this.length : index));
    },

    find: function (selector) {
      return wrapper(this._content.reduce(function (found, node) {
        return found.concat(wrapper(selector, node).get());
      }, []));
    }

  };

  Object.defineProperty(proto, 'length', {
    get: function () {
      return this._content.length;
    },
    set: function (val) {
      this._content.length = val;
    }
  });

  function wrapper(arg, ctx) {
    var obj = Object.create(proto)
      , query = []
      , nodes = [];

    obj._content = [];

    switch (true) {
      case (typeof arg === 'string'):
        if (proto.isPrototypeOf(ctx)) {
          return ctx.find(arg);
        }

        try {
          query = (ctx || document).querySelectorAll(arg);
        } catch (e) {
          !ctx && (nodes = wrapper.parseHTML(arg));
        }

        switch (true) {
          case (!!query.length):
            // valid selector
            obj._content = slice.call(query);
            break;
          case (!!nodes.length):
            // element nodes found
            obj._content = nodes;
            break;
          default:
            // neither
            break;
        }

        query = null;
        nodes = null;

        break;
      case (arg instanceof NodeList):
        // nodelist passed
        obj._content = slice.call(arg);
        break;
      case (arg instanceof Element || arg === document ||
          arg === window):
        // element node, document or window passed
        obj._content.push(arg);
        break;
      case (Array.isArray(arg)):
        // array passed
        obj._content = arg;
        break;
      case (proto.isPrototypeOf(arg)):
        // wrapped
        return arg;
      default:
        // neither
        break;
    }

    return obj;
  }

  wrapper.fn = proto;

  Object.getOwnPropertyNames(mixin).forEach(function (prop) {
    wrapper[prop] = mixin[prop];
  });

  return wrapper;
}));
