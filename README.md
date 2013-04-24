notify-queue
============
[![Build Status](https://travis-ci.org/danielbeardsley/notify-queue.png?branch=master)](https://travis-ci.org/danielbeardsley/notify-queue)

A Queue with a callback driven `pop()`.
`push()` and `pop()` are relatively normal,
but `pop()` instead takes a callback and is called whenever there is an item available.

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

Or, with matchers:

```js
var NotifyQueue = require('notify-queue');
var q = new NotifyQueue();

function processor(item, done) {
   someAsyncFunction(item, function(results) {
      // do something with results
      done();
   });
});

function matcher(item) {
  return item.isforMe == true;
}

q.pop(processor, matcher)

q.push("an item");
```

Interface
=========
### `queue.push(item)` ###
Adds an item to the queue triggering any waiting `pop()` callbacks.

### `queue.pop(callback[, matcher])` ###
Registers `callback` so it's called whenever an item is added to the queue.
If a `matcher` function is provided,
`callback` will only be called when `matcher(item)` returns something truthy.
Otherwise, `callback` will be called for any item.

`callback` is passed the item and a `done()` function.
`callback` will not be called again until after `done()` is called.
If `pop()` is called more than once,
available callbacks will be served items in a round-robin fashion.
An available callback is one that is not waiting for `done()` to be called.

### `queue.items()` ###
Returns the array of items currently in the queue.
This is the internal representation and
can be modified as necessary to remove or rearrange items.
