var promise = new Promise(function(resolve, reject) {

})

function Promise(executor) {
  var self = this
  self.status = 'pending'
  self.data = undefined
  self.onResolvedCallback = []
  self.onRejectedCallback = []

  function resolve(value) {
    if (value instanceof Promise) {
      return value.then(resolve, reject)
    }
    setTimeout(function() {
      if (status === 'pending') {
        self.status = 'resolved'
        self.data = value
        for (var i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](value)
        }
      }
    })
    
  }

  function reject(reason) {
    setTimeout(function() {
      if (self.status === 'pending') {
        self.status = 'rejected'
        self.data = reason
        for (var i = 0; i < self.onRejectedCallback; i++) {
          self.onRejectedCallback[i].reason
        }
      }
    })
  }

  try {
    executor(resolve, reject)
  } catch(reason) {
    reject(reason)
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  var then
  var thenCallOrThrow = false

  if (promise2 === x) {
    return reject(new TypeError('Chaing cycle detected for promise'))
  }

  if (x instanceof Promise) {
    if (x.status === 'pending') {
      x.then(function(v) {
        resolvePromise(promise2, v, resolve, reject)
      }, reject)
    } else {
      x.then(resolve, reject)
    }
    return
  }
  
  if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) {
    try {
      then = x.then
      if (typeof then === 'function') {
        then.call(x, function rs(y) {
          if (thenCallOrThrow) return
          thenCallOrThrow = true
          return resolvePromise(promise2, y , resolve, reject)
        }, function rj(r) {
          if (thenCallOrThrow) return
          thenCallOrThrow = true
          return reject(r)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (thenCallOrThrow) return
      thenCallOrThrow = true
      return reject(e)
    }
  } else {
    resolve(x)
  }
}

Promise.prototype.then = function(onResolved, onRejected) {
  var self = this
  var promise2

  onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return v}
  onRejected = typeof onRejected === 'function' ? onRejected : function(r) { throw r}

  if (self.status === 'resolved') {
    return promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onResolved(self.data)
        resolvePromise(promise2, x, resolve, reject)
      } catch (reason) {
        reject(reason)
      }
    })
  }

  if (self.status === 'rejected') {
    return promise2 = new Promise(function(resolve, reject) {
      try {
        var x = onRejected(self.data)
        resolvePromise(promise2, x, resolve, reject)
      } catch (reason) {
        reject(reason)
      }
    })
  }

  if (self.status === 'pending') {
    return promise2 = new Promise(function(resolve, reject) {
      self.onResolvedCallback.push(function(value) {
        try {
          var x = onResolved(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch(r) {
          reject(r)
        }
      })

      self.onRejectedCallback.push(function(reason) {
        try {
          var x = onRejected(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch(r) {
          reject(r)
        }
      })
    })
  }
}

Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}

Promise.deferred = Promise.defer = function() {
  var dfd = {}
  dfd.promise = new Promise(function(resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}