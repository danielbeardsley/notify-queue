notify-queue
============

A Queue with a callback driven `pop()`.
`push()` and `pop()` are relatively normal,
but `pop()` instead takes a callback and is called whenever an item is pushed.

It's ideal for creating a work-queue where each worker needs to process one item at a time and should be notified when new items are added.

Example Usage
=============

```js
var NotifyQueue = require('notify-queue');
var q = new NotifyQueue();

q.pop(function(item, done) {
   someasyncfunction(item, function() {
      done();
   });
});

q.push("an item");
```

Interface
=========
### `queue.push(item)` ###
Adds an item to the queue triggering any waiting `pop()` callbacks.

### `queue.pop(callback)` ###
Registers `callback` so it's called whenever an item is added to the queue.
`callback` is passed the item and a `done()` function.
`callback` will not be called again until after `done()` is called.
If `pop()` is called more than once,
available callbacks will be served items in a round-robin fashion.
An available callback is one that is not waiting for `done()` to be called.

### `queue.items()` ###
Returns the array of items currently in the queue.
This is the internal representation and
can be modified as necessary to remove or rearrange items.
