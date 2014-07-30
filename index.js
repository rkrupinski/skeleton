'use strict';

var domArray = require('dom-array')
  , parse = require('parse-html')
  , matches = require('matches-selector')
  , push = [].push
  , slice = [].slice;

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

  /* Miscellaneous */

  get: function (index) {
    return typeof index === 'undefined' ? this._content :
        this._content[index < 0 ? this.length + index : index];
  },

  /* Traversing */

  add: function () {
    var merged = this._content.concat(
      wrapper.apply(null, arguments).get());

    return wrapper.call(this, wrapper.unique(merged));
  },

  addBack: function (selector) {
    var merged;

    if (!this._prev) {
      return this;
    }

    merged = this._content.concat((selector ?
        this._prev.filter(selector) : this._prev).get()); 

    return wrapper.call(this, wrapper.unique(merged));
  },

  children: function (selector) {
    var children = getChildren.call(this, 'children', selector);

    return wrapper.call(this, children);
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

  contents: function () {
    var contents = getChildren.call(this, 'childNodes');

    return wrapper.call(this, contents);
  },

  each: function (fn) {
    this._content.forEach(function (element, index) {
      fn.call(element, index, element);
    });

    return this;
  },

  end: function () {
    var ret = this;

    while (ret._prev) {
      ret = ret._prev;
    }

    return ret;
  },

  eq: function (index) {
    return wrapper.call(this, this.get(
        typeof index === 'undefined' ? this.length : index));
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
      push.apply(ret, wrapper(selector, this).get());
    });

    return wrapper.call(this, wrapper.unique(ret));
  },

  first: function () {
    return this.eq(0);
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

  /* Properties */

  get length() {
    return this._content.length;
  },

  set length(val) {
    this._content.length = val;
  }

};

function getChildren(method, selector) {
  /*jshint validthis:true*/
  var ret = []
    , children;

  this.each(function () {
    children = slice.call(this[method]);

    if (selector) {
      children = wrapper(children).filter(selector).get();
    }

    push.apply(ret, children);
  });

  return ret;
}

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
