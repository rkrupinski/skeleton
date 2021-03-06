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

      while (current && current.nodeType !== 9) {
        if (matches(current, selector)) {
          ret.push(current);
          break;
        }

        current = getParent(current);
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

  filter: function (test, inverse) {
    var ret
      , cb;

    switch (true) {
      case (typeof test === 'function'):
        cb = function (element, index) {
          var ret = test.call(element, index, element);

          return inverse ? !ret : ret;
        };
        break;
      case (typeof test === 'string'):
        cb = function (element) {
          var ret = matches(element, test);

          return inverse ? !ret : ret;
        };
        break;
      default:
        cb = function () {
          return !!inverse;
        };
        break;
    }

    ret = this._content.filter(cb);

    return wrapper.call(this, ret);
  },

  find: function (selector) {
    var ret = [];

    if (selector) {
      ret = walkTheDOM.call(this, function (current) {
        return wrapper(selector, current).get();
      }, { once: true });
    }

    return wrapper.call(this, wrapper.unique(ret));
  },

  first: function () {
    return this.eq(0);
  },

  has: function (selector) {
    return this.filter(function () {
      return !!wrapper(selector, this).length;
    });
  },

  is: function (test) {
    return !!this.filter(test).length;
  },

  last: function () {
    return this.eq(this.length - 1);
  },

  map: function (fn) {
    var ret = this._content.map(function (element, index) {
      return fn.call(element, index, element);
    });

    return wrapper.call(this, ret);
  },

  next: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return current.nextElementSibling;
    }, { once: true, filter: selector });

    return wrapper.call(this, ret);
  },

  nextAll: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return current.nextElementSibling;
    }, { filter: selector });

    return wrapper.call(this, wrapper.unique(ret));
  },

  nextUntil: function (selector, filter) {
    var ret;

    if (!selector) {
      return this.nextAll();
    }

    ret = walkTheDOM.call(this, function (current) {
      return (current = current.nextElementSibling) &&
          !matches(current, selector) ? current : null;
    }, { filter: filter });

    return wrapper.call(this, wrapper.unique(ret));
  },

  not: function (test) {
    return this.filter(test, true);
  },

  offsetParent: function () {
    var ret = walkTheDOM.call(this, function (current) {
      return (current = current.offsetParent) ? current : null;
    }, { once: true });

    return wrapper.call(this, wrapper.unique(ret));
  },

  parent: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return getParent(current);
    }, { once: true, filter: selector });

    return wrapper.call(this, wrapper.unique(ret));
  },

  parents: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return (current = getParent(current)) &&
          current.nodeType !== 9 ? current : null;
    }, { filter: selector });

    return wrapper.call(this, wrapper.unique(ret));
  },

  parentsUntil: function (selector, filter) {
    var ret;

    if (!selector) {
      return this.parents();
    }

    ret = walkTheDOM.call(this, function (current) {
      return (current = getParent(current)) &&
        current.nodeType !== 9 && !matches(current, selector) ?
        current : null;
    }, { filter: filter });

    return wrapper.call(this, wrapper.unique(ret));
  },

  prev: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return current.previousElementSibling;
    }, { once: true, filter: selector });

    return wrapper.call(this, ret);
  },

  prevAll: function (selector) {
    var ret = walkTheDOM.call(this, function (current) {
      return current.previousElementSibling;
    }, { filter: selector });

    return wrapper.call(this, wrapper.unique(ret));
  },

  prevUntil: function (selector, filter) {
    var ret;

    if (!selector) {
      return this.prevAll();
    }

    ret = walkTheDOM.call(this, function (current) {
      return (current = current.previousElementSibling) &&
          !matches(current, selector) ? current : null;
    }, { filter: filter });

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

function filterNodes(arr, test) {
  return test ? wrapper(arr).filter(test).get() : arr;
}

function walkTheDOM(cb, options) {
  /*jshint validthis:true*/
  var o = options || {}
    , ret = []
    , current;

  this.each(function () {
    current = this;

    while (current = cb(current)) {
      Array.isArray(current) ? push.apply(ret, current) :
          ret.push(current);

      if (o.once) {
        break;
      }
    }
  });

  ret = filterNodes(ret, o.filter);

  return ret;
}

function getChildren(mode, selector) {
  /*jshint validthis:true*/
  var ret = walkTheDOM.call(this, function (current) {
    return slice.call(current[mode]);
  }, { once: true });

  ret = filterNodes(ret, selector);

  return ret;
}

function getParent(node) {
  var parent = node.parentNode;

  return parent && parent.nodeType !== 11 ? parent : null; 
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
