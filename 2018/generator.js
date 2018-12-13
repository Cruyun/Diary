/**
 * 
 * @param {Function} cb 
 */

function generator(cb) {
  return (
    function() {
      var object =  {
        next: 0,
        stop: function() {}
      };
      return {
        next: function() {
          var ret = cb(object);
          if (ret === undefined) {
            return {value: undefined, done: true}
          }
          return {
            value: ret,
            done: false
          }
        }
      }
    })();
}

/**
 * Method2
 */
class RangeIterator {
  constructor(start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() { return this; }

  next() {
    var value = this.value;
    if (value < this.stop) {
      this.value++;
      return {done: false, value: value};
    } else {
      return {done: true, value: undefined};
    }
  }
}

// Return a new iterator that counts up from 'start' to 'stop'.
function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value)
}


ref: [ES6 In Depth: Generators](https://hacks.mozilla.org/2015/05/es6-in-depth-generators/)