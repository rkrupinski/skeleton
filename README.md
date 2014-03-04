skeleton
========

Proof of concept jQuery-compatible DOM library skeleton.

Example `.find(selector)` method implementation:
```js	
var proto = {

  /* ... */

  find: function (selector) {
    return wrapper(this._content.reduce(function (found, node) {
      return found.concat(wrapper(selector, node).get());
    }, []));
  }

};
```

Example plugin implementation:
```js 
$.fn.colorize = function (options) {
  return this.each(function () {
    this.style.color = options.color;
  });
};
```