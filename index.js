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
    var ret = [];

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

    this.each(function () {
      [].push.apply(ret, wrapper(selector, this).get());
    });

    return wrapper(wrapper.unique(ret));
  },

  parent: function (selector) {
    var ret = [];

    this.each(function () {
      var parent = getParent(this);

      if (parent && selector) {
        parent = matches(parent, selector) ? parent : null;
      }

      parent && ret.push(parent);
    });

    return wrapper(wrapper.unique(ret));
  },

  parents: function (selector) {
    var ret = [];

    this.each(function () {
      var parent = getParent(this);

      while (parent && parent !== document) {
        if (!selector || matches(parent, selector)) {
          ret.push(parent);
        }

        parent = parent.parentNode;
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
