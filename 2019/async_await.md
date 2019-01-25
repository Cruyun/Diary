# async/await

Async 函数：函数前面有一个关键字 `async`，`await` 关键字在函数内，所有的` async` 函数会隐式的返回一个 `promise`，`promise` 的完成值是 async 函数的返回值。

```
async function test() {
  return "1";
}
console.log(test()); // -> Promise {<resolved>: "1"}
```

await 只能在 async 函数中使用

```
function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('finish')
      resolve("sleep");
    }, 2000);
  });
}
async function test() {
  let value = await sleep();
  console.log("object");
}
test()
```

上面代码会先打印 finish 然后再打印 object 。因为 await 会等待 sleep 函数 resolve ，所以即使后面是同步代码，也不会先去执行同步代码再来执行异步代码。

async 和 await 相比直接使用 Promise 来说，优势在于处理 then 的调用链，能够更清晰准确的写出代码。缺点在于滥用 await 可能会导致性能问题，因为 await 会阻塞代码，也许之后的异步代码并不依赖于前者，但仍然需要等待前者完成，导致代码失去了并发性。

下面来看一个使用 await 的代码。

```
var a = 0
var b = async () => {
  a = a + await 10
  console.log('2', a) // -> '2' 10
  a = (await 10) + a
  console.log('3', a) // -> '3' 20
}
b()
a++
console.log('1', a) // -> '1' 1
```

对于以上代码你可能会有疑惑，这里说明下原理

首先函数 b 先执行，在执行到 await 10 之前变量 a 还是 0，因为在 await 内部实现了 generators ，generators 会保留堆栈中东西，所以这时候 a = 0 被保存了下来
因为 await 是异步操作，遇到await就会立即返回一个pending状态的Promise对象，暂时返回执行代码的控制权，使得函数外的代码得以继续执行，所以会先执行 console.log('1', a)
这时候同步代码执行完毕，开始执行异步代码，将保存下来的值拿出来使用，这时候 a = 10
然后后面就是常规执行代码了。

不能在代码顶层写 await。`await getJSON()` 意味着 `console.log` 调用会一直等待，直到 `getJSON()  promise` 完成并打印出它的值。

* *JS异步编程，Promise 和 async await 有什么不同，怎么捕捉错误*

- Async/await 是建立在 Promises上的，不能被使用在普通回调以及节点回调
- Async/await 和 Promises 很像，不阻塞
- Async/await 代码看起来像同步代码。

`promise` 通过链式调用，`promise` 可以直接在 `then` 中返回一个新的 `promise` 来将异步操作串联起来，也有了统一的 `catch` 来做错误处理。美中不足的是，你仍然需要传递一个回调函数给 `then`，通过 `then` 来串联虽然保证了至少代码顺序上和真正的逻辑顺序一致，但和同步代码的差别仍然很大。

async/await 则直接将其变成了同步的写法
`async` 是 `Generator` 的语法糖，`Generator`是可以用来实现 `async` 的，用 `Generator` 来实现 `async` 的核心就是实现这种不需`next` 调用自执行的内容。

[JavaScript 的 Async/Await 完胜 Promise 的六个理由 - w3ctech](https://www.w3ctech.com/topic/2021)
1. 简洁：不用写 `then`创建匿名函数，减少嵌套
2. 错误处理：我们需要在 promise 上调用 .`catch`，并且重复错误处理代码。Async/await 会最终让我们用同样的结构（ `try/catch`）处理同步和异步代码变成可能
3. if 语句
4. 中间值（promise3需要promise1和2的值
5. 错误栈  假如在一段链式调用调用多个 promise，在链的某一个地方抛出错误，从 promise 链返回的错误栈中无法找到哪里抛出的错误， 但来自Async/Await 的错误栈指向包含错误的函数
