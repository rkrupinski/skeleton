'use strict';

var domArray = require('dom-array')
  , parse = require('parse-html')
  , matches = require('matches-selector');

var mixin = {

  parseHTML: function (str) {
    return typeof str === 'string' && str.length ?
        parse(str) : null;
  },

  contains: function (parent, child) {
    return parent === child ? false : parent.contains(child);
  },

  unique: function (arr) {
    var ret;

    if (arr.length < 2) {
      return arr;
    }

    ret = [];

    for (var i = 0, l = arr.length; i < l; i++) {
      !~ret.indexOf(arr[i]) && ret.push(arr[i]);
    }

    return ret;
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
    return wrapper.call(this, this.get(
        typeof index === 'undefined' ? this.length : index));
  },

  first: function () {
    return this.eq(0);
  },

  filter: function (test) {
    var ret = [];

    switch (true) {
      case (typeof test === 'function'):
        ret = this._content.filter(function (element, index) {
          return test.call(element, index, element);
        });
        break;
      case (typeof test === 'string'):
        ret = this._content.filter(function (element) {
          return matches(element, test);
        });
        break;
    }

    return wrapper.call(this, ret);
  },

  find: function (selector) {
    var ret = [];

    selector && this.each(function () {
      [].push.apply(ret, wrapper(selector, this).get());
    });

    return wrapper.call(this, wrapper.unique(ret));
  },

  parent: function (selector) {
    var ret = []
      , current;

    this.each(function () {
      current = getParent(this);

      if (current && selector) {
        current = matches(current, selector) ? current : null;
      }

      current && ret.push(current);
    });

    return wrapper.call(this, wrapper.unique(ret));
  },

  parents: function (selector) {
    var ret = []
      , current;

    this.each(function () {
      current = getParent(this);

      while (current && current !== document) {
        if (!selector || matches(current, selector)) {
          ret.push(current);
        }

        current = current.parentNode;
      }
    });

    return wrapper.call(this, wrapper.unique(ret));
  },

  closest: function (selector) {
    var ret = []
      , current;

    selector && this.each(function () {
      current = this;

      while (current && current !== document) {
        if (matches(current, selector)) {
          ret.push(current);
          break;
        }

        current = current.parentNode;
      }
    });

    return wrapper.call(this, wrapper.unique(ret));
  },

  add: function () {
    var merged = wrapper.apply(null, arguments).get()
        .concat(this._content);

    return wrapper.call(this, wrapper.unique(merged));
  },

  addBack: function (selector) {
    var merged;

    if (!this._prev) {
      return this;
    }

    merged = (selector ? this._prev.filter(selector) :
        this._prev).get().concat(this._content);

    return wrapper.call(this, wrapper.unique(merged));
  },

  get length() {
    return this._content.length;
  },

  set length(val) {
    this._content.length = val;
  }

};

function getParent(node) {
  return wrapper.contains(document, node) ? 
      node.parentNode : null;
}

function wrapper(arg, ctx) {
  /*jshint validthis:true*/
  var obj;

  switch (true) {
    case (proto.isPrototypeOf(arg)):
      obj = arg;
      break;
    case (proto.isPrototypeOf(ctx)):
      obj = ctx.find(arg);
      break;
    default:
      obj = Object.create(proto, {
        _content: {
          value: domArray.apply(null, arguments)
        }
      });
      break;
  }

  Object.defineProperty(obj, '_prev', {
    value: this || null,
    writable: true
  });

  return obj;
}

Object.getOwnPropertyNames(mixin).forEach(function (prop) {
  wrapper[prop] = mixin[prop];
});

wrapper.fn = proto;

module.exports = wrapper;
