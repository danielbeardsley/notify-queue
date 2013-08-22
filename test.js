var Queue  = require('./index')
  , assert = require('assert');

describe("Queue", function() {
   describe(".push() and .pop()", function() {
      it("should enqueue and dequeue items", function (done) {
         var job = {a: 1, b: 2},
            cb = 0,
            queue = new Queue();
        
         queue.push(job);
         queue.pop(function(retjob, next) {
            cb++;
            assert.equal(cb, 1);
            assert.equal(job, retjob);
            next();
            // Ensure this callback doesn't get called again by
            // delaying the done()
            later(function() { done(); });
         });
      });

      it("should have a max concurrency of 1", function (done) {
         var job = {a: 1, b: 2},
            queue = new Queue(),
            cb = 0,
            concurrency = 0;

         queue.push(job);
         queue.push(job);
         queue.pop(function(retjob, next) {
            concurrency++;
            cb++;
            if (concurrency > 1) assert.fail();
            // delay a bit
            later(function() {
              next();
              concurrency--;
              if (concurrency == 0 && cb == 2) done();
            });
         });
      });

      it("should allow a filtering function", function (done) {
         var queue = new Queue();
         var count = 8;

         queue.pop(asserter(/a/), matcher(/a/));
         queue.pop(asserter(/b/), matcher(/b/));

         queue.push('a');
         queue.push('a');
         queue.push('b');
         queue.push('b');
         queue.push('a');
         queue.push('b');
         queue.push('b');
         queue.push('b');
         function matcher(regex) {
            return function(job) {
               return regex.test(job);
            }
         }

         function asserter(regex) {
            return function(job, next) {
               assert.ok(regex.test(job));
               setTimeout(function() {
                  next();
                  if (--count <= 0) done();
               },0);
            }
         }
      });

      it("should work when pop is called first", function (done) {
         var job = {a: 1, b: 2},
            cb = 0,
            ready = false,
            queue = new Queue();
        
         queue.pop(function(retjob, next) {
            cb++;
            assert.ok(ready);
            assert.equal(cb, 1);
            assert.equal(job, retjob);
            next();
            // Ensure this callback doesn't get called again by
            // delaying the done()
            later(function() { done(); });
         });
         later(function() {
            ready = true;
            queue.push(job);
         });
      });
   });

   describe(".pop()", function() {
      it("should provide a function to cancel the popping()", function (done) {
         var queue = new Queue();

         var cancel = queue.pop(function(job) {
            assert.fail();
            later(function() { done(); });
         });
         cancel();
         queue.push({});
         later(function() {
           done();
         });
      });
   });

   describe(".items()", function() {
      it("should return an array of the currently queued items", function(testDone) {
         var queue = new Queue();
         queue.push(1);
         queue.push(2);
         queue.push(3);
         assert.deepEqual(queue.items(), [1,2,3]);
         queue.pop(function(item, done) {
            assert.deepEqual(queue.items(), [2,3]);
            testDone()
         });
      });
   });
});

function later(callback) {
   process.nextTick(function() {
      process.nextTick(callback);
   });
}
