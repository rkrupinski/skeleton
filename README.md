skeleton
========

Proof of concept jQuery-compatible DOM library skeleton.

Example `.find(selector)` method implementation:
```js	
var proto = {

  /* ... */

  find: function (selector) {
    return wrapper(this._content.reduce(function (prev, curr) {
      return curr instanceof Element ?
          prev.concat(wrapper(selector, curr).get()) : prev;
    }, []));
  }

};
```

Example plugin implementation:
```js 
$.fn.colorize = function (options) {
  return this.each(function (index, element) {
    this.style.color = options.color;
  });
};
```