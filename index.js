function Queue() {
   this.queue = [];
   this.waiting = [];
};

module.exports = Queue;

Queue.prototype._notify = function() {
  var self = this
    , clients = this.waiting
    , queue = this.queue
    , client = null
    , item = null;
  
  if (!clients.length || !queue.length) {
    return;
  }

  for (var i=0, len=queue.length; i < len; i++) {
    client = self._findClientFor(queue[i]);
    /**
     * If we find a client that can handle this item, 
     * then THIS is the item we'll be processing.
     */
    if (client) {
      item = queue.splice(i, 1)[0];
      break;
    }
  }

  if (item !== null) {
    client.callback(item, function() {
      process.nextTick(function() {
        clients.push(client);
        self._notify();
      });
    });
  }
}

Queue.prototype.push = function push(item) {
  this.queue.push(item);
  this._notify();
}

Queue.prototype.pop = function pop(callback, matcher) {
  var waiting = this.waiting;
  var popper = {
    callback: callback,
    matcher:  matcher
  };
  waiting.push(popper);
  this._notify();
  return function cancel() {
    waiting.splice(waiting.indexOf(popper),1);
  }
}

/**
 * Search for a client that can accept the item.
 * if a client didn't specify a matcher, then they
 * accept any item.
 */
Queue.prototype._findClientFor = function _findClientFor(item) {
  var clients = this.waiting;
  var clientIndex = null;
  for (var i=0, len=clients.length; i<len; i++) {
    var matcher = clients[i].matcher;
    if (!matcher || matcher(item)) {
      clientIndex = i;
      break;
    }
  }

  if (clientIndex !== null) {
    return clients.splice(clientIndex, 1)[0];
  }
}

Queue.prototype.items = function() {
  return this.queue;
}

