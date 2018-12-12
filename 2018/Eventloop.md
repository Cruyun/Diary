# Event Loop
JS是一门非阻塞单线程编程语言，因为在最初 JS 就是为了和浏览器交互而诞生的。如果 JS 是门多线程的语言话，我们在多个线程中处理 DOM 就可能会发生问题（一个线程中新加节点，另一个线程中删除节点），当然可以引入读写锁解决这个问题。

## 浏览器环境中的Event loop
### 执行栈和事件队列

*执行栈：*

当 JavaScript 代码执行的时候会将不同的变量存于内存中的不同位置：

- 堆（heap）：对象， 引用数据流行地址，基础数据类型，
- 栈（satck）：函数调用
- 执行上下文：方法的私有作用域，上层作用域的指向，方法的参数，作用域中的对象以及 this
- 执行栈：当一系列方法被依次调用时，由于JS是单线程的，同一时间只能执行一个方法，于是这些方法被排队在一个单独的地方，即*执行栈*。

一个方法执行时会向执行栈中加入这个方法的执行环境。

*事件队列：* 执行异步事件

JS引擎遇到一个异步事件时，不会一直等待其返回结果，而会将这个时间挂起，继续执行 执行栈中的其他事件。当一个一步事件返回结果时，JS会将这个事件加入与当前执行栈不同的另一个队列，即*事件队列*。

事件队列中的方法不会立刻执行其回调函数，而是等待当前执行栈中的所有任务都执行完毕，主线程处于闲置状态时，主线程回去查找事件队列是都有任务。如果有，那么主线程会从中取出队首的时间，将事件的回调放入执行栈中，然后执行其中的同步代码。反复如此，形成Event Loop。

### 宏任务和微任务

不同的异步任务被分为两类：
1. 微任务（micro task or  jobs）：

- `process.nextTick`（node.js）
- `promise.then`
- `Object.observe`
- `MutationObserver`

2. 宏任务（macro task or tasks）：
- `script`
- `setTimeout`
- `setImmediate`（nodejs）
- `I/O`
-  `UI redering`
- `psotMessage`
- MessageChannel

当 当前执行栈执行完毕时：
1. 清空微任务队列中的事件
2. 然后再去宏任务队列中取出一个事件

微任务不一定快于宏任务。因为宏任务中包括了 script ，浏览器会先执行一个宏任务，接下来有异步代码的话就先执行微任务。

### 一次 Event loop 顺序
1. 执行同步代码（宏任务）
2. 执行栈为空，查看是否有微任务
3. 执行微任务
4. 必要时渲染UI
5. 开始下一轮Event loop ，执行宏任务中的异步代码

通过上述的 Event loop 顺序可知，如果宏任务中的异步代码有大量的计算并且需要操作 DOM 的话，为了更快的 界面响应，我们可以把操作 DOM 放入微任务中。

🌰：

```
setTimeout(function () {
    console.log(1);
});

new Promise(function(resolve,reject){
    console.log(2)
    resolve(3)
}).then(function(val){
    console.log(val);
})
// 2 3 1
```

```
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

new Promise((resolve) => {
    console.log('Promise')
    resolve()
}).then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');
// script start => Promise => script end => promise1 => promise2 => setTimeout
```


## Node.js环境
node中事件循环的实现是依靠的libuv引擎。我们知道node选择 Chrome V8引擎作为js解释器，v8引擎将js代码分析后去调用对应的node api，而这些api最后则由libuv引擎驱动，执行对应的任务，并把不同的事件放在不同的队列中等待主线程执行。 因此实际上node中的事件循环存在于libuv引擎中。

### 事件机制模型

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

> 每一个盒子对应一个阶段，每个阶段都有各自的队列

### 6个阶段

- *timers：*执行 `setTimeout()` 和 `setInterval()` 的回调

一个 timer 指定的时间并不是准确时间，而是在达到这个时间后巨快执行回调，可能会因为系统正在执行别的事件而延迟。

即使延时设为0毫秒，但由于 HTML5 标准规定这个函数第二个参数不得小于 4 毫秒，所以实际上不是0毫秒延时。

- *pending callbacks：*执行IO（除了 close 事件，定时器和 `setImmediate`）回调
- *idle, prepare：*内部实现
- *poll：* 执行到点的计时器，poll 队列中的事件

当 poll 中没有定时器的情况下，会发现以下两件事情
- 如果 poll 队列不为空，会遍历回调队列并同步执行，直到队列为空或者系统限制
- 如果 poll 队列为空，会有两件事发生
 - 如果有 setImmediate 需要执行，poll 阶段会停止并且进入到 check 阶段执行 setImmediate
 - 如果没有 setImmediate 需要执行，会等待回调被加入到队列中并立即执行回调
如果有别的定时器需要被执行，会回到 timer 阶段执行回调。

总结：

先查看 poll queue 中是否有任务，如果有就按照先进先出的顺序执行完。当 queue 为空时，查看是否有setImmediate()需要执行。如果有，那么会停止 并进入 check 阶段执行setImmediate；如果没有，会停留等待，知道一个I/O被加入队列里面并立刻执行其回调。同时会检查是否有到期的定时器，如果有就回到 timer 阶段去执行器回调。

- *check：*执行 `setImmediate()` 的回调
- *close callbacks：*一些 close 事件的回调，如`socket.on('close', ...)`

在每一轮 event loop 里，Node.js都会检查是否有同步IO或者计时器在等待执行， 如果没有，就清空。

### setImmediate() vs setTimeout()
二者很相似，但是他们在调用的不同决定了行为的不同

- setImmediate() ：一旦最近的 poll 阶段完成，它用于执行一段脚本。
- setTimeout()：安排在经过最小阈值（ms后）执行的脚本。

他们之间的顺序有时候是随机的：

```
setTimeout(() => {
    console.log('setTimeout');
}, 0);
setImmediate(() => {
    console.log('setImmediate');
})
// 这里可能会输出 setTimeout，setImmediate
// 可能也会相反的输出，这取决于性能
// 因为可能进入 event loop 用了不到 1 毫秒，这时候会执行 setImmediate
// 否则会执行 setTimeout
```

在下面这种情况是固定的：

```
var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('timeout');
    }, 0);
    setImmediate(() => {
        console.log('immediate');
    });
});
// 因为 readFile 的回调在 poll 中执行
// 发现有 setImmediate ，所以会立即跳到 check 阶段执行回调
// 再去 timer 阶段执行 setTimeout
// 所以以上输出一定是 setImmediate，setTimeout
```

### process.nextTick()

node中存在着一个特殊的队列，即nextTick queue。

process.nextTick()不是 event loop 里面的一个部分，但是无论 event loop 位于哪个阶段，`nextTickQueue`都会在当前操作完成后被执行。

当事件循环准备进入下一个阶段之前，会先检查nextTick queue中是否有任务，如果有，那么会先清空这个队列。 

这可能会产生一些不良情况，因为它允许你通过进行递归 `process.nextTick（）`调用来“starve”I / O，这会阻止事件循环到达轮询阶段。

microTasks 的执行时机是当执行完所有的 nextTick 的回调之后。假如没有 process.nextTick 就直接从 node 里面调用 RunMicrotasks 加快速度。

#### `process.nextTick()` vs `setImmediate()`

> `process.nextTick()` fires more immediately than `setImmediate()`.

### 流程
1. 首次加载：将计时器（ setTimeout、setInterval ）的回调注册到 timer的队列中，将 Promise.resolve 等 microTask 的回调注册到 microTasks，将 setImmediate 注册到 immediate Queue 中，将 process.nextTick 注册到 nextTick Queue 中。
2. event loop 开始：进入 timers，执行到期的计时器
3. 进入 poll：详见上面 poll 阶段总结
4. check：执行 setImmediate的回调
5. 每次切换阶段前都检查是否有 nextTick 和 microTasks。同步读取完后到异步 timer 阶段开始也是切换了阶段，也要先清空一次nextTick 和 microTasks。

一个复杂的例子见：[做面试的不倒翁：一道事件循环题引发的血案 - 掘金](https://juejin.im/post/5bbee9d36fb9a05cff32388d)

参考及推荐阅读：

- 部分原文翻译自[The Node.js Event Loop, Timers, and process.nextTick() | Node.js](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Concurrency model and Event Loop | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [CS-Interview-Knowledge-Map/browser-ch.md at master · InterviewMap/CS-Interview-Knowledge-Map · GitHub](https://github.com/InterviewMap/CS-Interview-Knowledge-Map/blob/master/Browser/browser-ch.md#event-loop)
- [SUMMARY/event_loop.md at master · fengzi2016/SUMMARY · GitHub](https://github.com/fengzi2016/SUMMARY/blob/master/interview/event_loop.md)
