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
    return wrapper(this.get(typeof index === 'undefined' ?
        this.length : index));
  },

  first: function () {
    return this.eq(0);
  },

  find: function (selector) {
    var ret = [];

    selector && this.each(function () {
      [].push.apply(ret, wrapper(selector, this).get());
    });

    return wrapper(wrapper.unique(ret));
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

    return wrapper(wrapper.unique(ret));
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

    return wrapper(wrapper.unique(ret));
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

    return wrapper(wrapper.unique(ret));
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
  var ret;

  switch (true) {
    case (proto.isPrototypeOf(arg)):
      ret = arg;
      break;
    case (proto.isPrototypeOf(ctx)):
      ret = ctx.find(arg);
      break;
    default:
      ret = Object.create(proto, {
        _content: {
          value: domArray.apply(null, arguments)
        }
      });
      break;
  }

  return ret;
}

Object.getOwnPropertyNames(mixin).forEach(function (prop) {
  wrapper[prop] = mixin[prop];
});

wrapper.fn = proto;

module.exports = wrapper;
