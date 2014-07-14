skeleton
========
Proof of concept jQuery-compatible DOM library skeleton.

Taking it further
-----------------
Writing a plugin:
```js
var $ = require('./lib/skeleton');

$.fn.batman = function () {
  return this.each(function (element) {
    element.innerHTML = 'BATMAN';
  });
};
```

Adding a method for form serialization:
```js
serialize: function () {
  var ignored = ['submit', 'button', 'reset'];

  return function () {
    var ret = []
      , chunk;

    this.each(function (index, item) {
      chunk = null;

      switch (true) {
        case (item.nodeName.toLowerCase() === 'form'):
          chunk = wrapper(slice.call(item.elements))
              .serialize();
          break;
        case (item.name && ignored.indexOf(item.type) === -1):
          chunk = [item.name, item.value ? item.value : '']
              .join('=');
          break;
      }

      chunk && ret.push(chunk);
    });

    return ret.join('&');
  };
}()
```
