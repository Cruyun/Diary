# Promise

Promise 是一个对象，它起到代理作用（proxy），充当异步操作与回调函数之间的中介。它使得异步操作具备同步操作的接口，使得程序具备正常的同步运行的流程，摆脱了回调地狱。

它的思想是，每一个异步任务立刻返回一个Promise对象，这个对象有一个 then 方法，允许指定回调函数，在异步任务完成后调用。

## Syntax
`new Promise( /* executor */ function(resolve, reject) { ... } );`

## Methods

- Promise.all(iterable)
- Promise.race(iterable)
- Promise.reject(reason)
- Promise.resolve(value)

## Promise prototype
 Properties ：Promise.prototype.constructor

### Methods

- Promise.prototype.catch(onRejected)
- Promise.prototype.finally(onFinally)
- Promise.prototype.then(onFulfilled, onRejected)

以下是翻译[Promises/A+](https://promisesaplus.com/)对原生实现Promise的（大部分）要求，理解了如何原生实现也就很自然的掌握了 promise。（翻译有错漏，请尽量看原文）

## 2. Requirements
### 2.1 States
一个 promise 只有可能是以下三种状态之一：pending，fulfilled， 或rejected.。

可以把他看成一个状态机。

2.1.1. 为 pending 时，可能转为 fulfilled 或 rejected
2.1.2/3 . 为 fulfilled 或 rejected 时，不可能转为其他状态，必须有一个不可变的值（===）。

![](https://mdn.mozillademos.org/files/15911/promises.png)

### 2.2  then 方法

then 方法可以获得上一次 promise 中 resolve 的value或者 reject 的 reason，它返回一个 promise。

`Promise.prototype.then(onFulfilled, onRejected)`

1. 当onFulfilled 和 onRejected都为可选参数时，如果某个不为函数则会被忽略。
2. 如果 onFulfilled 是一个函数，它会在 promise 为 fulfilled 的时候被调用（有且仅有一次， with no this value），将 value 作为他的第一参数。
3. 如果 onRejected是一个函数，它会在 promise 为 rejected 的时候被调用（有且仅有一次， with no this value），将 reason 作为他的第一参数。

在执行上下文堆栈仅包含platform code之前，不得调用onFulfilled或onRejected。（platform code：engine, environment, and promise implementation code）

`promise2 = promise1.then(onFulfilled, onRejected);`

1. 如果onFulfilled 或者 onRejected 返回一个值 x，那么将会运行`[[Resolve]](promise2, x)`.
2. 如果onFulfilled或者 onRejected抛出了异常 e，`promise2`必须是`rejected`并且以 e 作为 `reason`
3. 如果`onFulfilled` 不是一个函数并且`promise1`为 fulfilled时，`promise2`是以与 promise1相同的value 而fulfilled。
4.  如果`onRejected` 不是一个函数并且`promise1`为 rejected 时，`promise2`是以与 promise1相同的reason而 rejected。



### 2.3 A Promise Resolution Procedure
运行`[[Resolve]](promise, x)`有以下步骤：

2.3.1  如果`promise`和`x`指向同一个对象，promise 会被 reject 并且抛出`TypeError`作为 reason。

2.3.2  如果 x 是一个 promise，接受他的状态：
	2.3.2.1 如果 x 在 pending，`promise`也保持`pending`直到x 转为fulfilled 或者 rejected
	2.3.2.2 如果 x 为 fulfilled， `promise`将以与 x 相同的 value 而fulfill。
	2.3.2.3 如果x为 rejected 时，`promise`是将与 x 相同的reason而 reject。

2.3.2  如果 x 是一个对象或 function：
	2.3.2.1 让 then 变为 x.then
	2.3.3.2  如果x.then抛出一个一场 e，那么 promise 也将以 e 作为 reason 而 reject。
	2.3.3.3 如果 then 是一个函数，将 x 作为 this 调用，`resolvePromise`和`rejectPromise`分别作为第一、二个参数：
		2.3.3.3.1 如果 `resolvePromise`以 `y` 为value被调用，那么运行`[[Resolve]](promise, y)`；
		2.3.3.3.2 如果 `rejectPromise`以 `r` 为reason被调用，那么 `promise` 也将以 `r` 作为 reason 而 reject；
		2.3.3.3.3 如果 `resolvePromise` 和`rejectPromise` 其中一个执行过的话，忽略其他的。
		2.3.3.3.4 如果调用 then 时抛出异常 e
				2.3.3.3.4.1 如果 `resolvePromise` 和`rejectPromise` 其中一个执行过的话，忽略它
				2.3.3.3.4.2 否则，promise 也将以 e 作为 reason 而 reject
	2.3.3.4 如果 then 不是一个函数，以 x 为 value 将 promise fulfill
2.3.4 如果 x 不是一个函数或者对象，以 x 为 value 将 promise fulfill

参考及更多阅读：

- [Promises/A+](https://promisesaplus.com/)
- [Promise - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Promise_prototype)
- [ES5原生实现](https://github.com/InterviewMap/CS-Interview-Knowledge-Map/blob/master/JS/JS-ch.md#promise-%E5%AE%9E%E7%8E%B0)