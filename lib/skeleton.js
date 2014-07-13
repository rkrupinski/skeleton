'use strict';

var domArray = require('dom-array');

var mixin = {

  parseHTML: function (str) {
    return typeof str === 'string' && str.length ?
        domArray(str) : null;
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
    return wrapper(this._content.reduce(function (found, node) {
      return found.concat(wrapper(selector, node).get());
    }, []));
  },

  get length() {
    return this._content.length;
  },

  set length(val) {
    this._content.length = val;
  }

};

function wrapper(arg, ctx) {
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

  return obj;
}

Object.getOwnPropertyNames(mixin).forEach(function (prop) {
  wrapper[prop] = mixin[prop];
});

wrapper.fn = proto;

module.exports = wrapper;
