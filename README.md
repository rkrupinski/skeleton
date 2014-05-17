skeleton
========
Proof of concept jQuery-compatible DOM library skeleton.

Example plugin implementation:
```js 
$.fn.funkyText = function (options) {
  return this.each(function () {
    this.style.color = options.color || 'pink';
  });
};
```