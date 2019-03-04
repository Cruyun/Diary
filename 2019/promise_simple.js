function Promise(callback) {
  var self = this;
  self.data = undefined;
  self.status = 'pending';
  self.onResolvedCallback = [];
  slef.onRejectedCallback = [];

  callback(resolve, reject);

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'resolved';
      self.data = value;
      for (let i = 0; i < onResolvedCallback.length; i++) {
        self.onResolvedCallback[i](value);
      }
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected';
      self.data = reason;
      for (let i = 0; i < onRejectedCallback.length; i++) {
        self.onRejectedCallback[i](reason);
      }
    }
  }
}

Promise.prototype.then = function(onResolved, onRejected) {
  var self = this;
  var promise2;

  onResolved = typeof onResolved === 'function' ? onResolved : function(value) {return value};
  onRejected = typeof onRejected === 'function' ? onRejected : function(reason) {throw reason};

  if (self.status === 'resolved') {
    return new Promise(function(resolve, reject) {
      try {
        var x = onResolved(resolve);
        if (x instanceof Promise) {
          x.then(resolve, reject);
        }
        resolve(x);
      } catch (reason) {
        reject(reason)
      }
    })
  }

  if (self.status === 'rejected') {
    return new Promise(function(resolve, reject) {
      try {
        var x = onRejected(reject);
        if (x instanceof Promise) {
          x.then(resolve, reject);
        }
      } catch (reason) {
        reject(reason);
      }
    })
  }

  if (self.status === 'pending') {
    return new Promise(function(resolve, reject) {
      self.onRejectedCallback.push(function (resolve, reject) {
        try {
          var x = onResolved(resolve);
          if (x instanceof Promise) {
            x.then(resolve, reject);
          }
          resolve(x);
        } catch (reason) {
          reject(reason);
        }
      })

      self.onRejectedCallback.push(function (resolve, reject) {
        try {
          var x = onRejected(reason);
          if (x instanceof Promise) {
            x.then(resolve, reject);
          }
        } catch (reason) {
          reject(reason);
        }
      })
    })
  }
}

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
}