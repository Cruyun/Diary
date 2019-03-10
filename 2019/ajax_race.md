# Ajax请求竞态问题，如何解决，如何优化

### 1.  协调交互顺序来处理：门

```
var res = [];
function response(data) {
    if (data.url == “http://some.url.1”) {
        res[0] = data;
    }
    else if (data.url == “http://some.url.2”) {
        res[1] = data;
    }
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax(“http://some.url.1”, response);
ajax(“http://some.url.2”, response);
```

不管哪个Ajax响应先返回，我们都要通过查看 data.url判断应该把响应数据放在 res 数组中的什么位置。
这个方法可以应用于多个并发函数盗用通过共享DOM彼此之间的交互情况，比如一个函数调用更新DOM的内容，另一个更新其样式，可是你想让这个DOM元素再拿到内容之后和样式一起出现。

### 2. 门

```
var a, b;
function foo(x) {
    a = x * 2;
    if (a && b) {
        baz();
    }
}
function bar(y) {
    b = y * 2;
    if (a && b) {
        baz();
    }
}
function baz() {
    console.log(a + b);
}
// ajax(..)是某个库中的某个Ajax函数
ajax(“http://some.url.1”, foo);
ajax(“http://some.url.2”, bar);
```
if (a && b)称为门

### 3. 门闩

类似于添加一个锁变量

```
var a;
function foo(x) {
    a = x * 2;
    baz();
}
function bar(x) {
    a = x / 2;
    baz();
}
function baz() {
    console.log(a);
}
// ajax(..)是某个库中的某个Ajax函数
ajax(“http://some.url.1”, foo);
ajax(“http://some.url.2”, bar);
```

条件判断if(!a)使得只有foo()和bar()中的第一个可以通过，第二个（实际上是任何后续的）调用会被忽略。

### 4. 并发协作

取到一个长期运行的“进程”，并将其分割成多个步骤或多批任务，使得其他并发“进程”有机会将自己的运算插入到事件循环队列中交替运行。

```
var res = [];
// response(..)从Ajax调用中取得结果数组
function response(data) {
    // 添加到已有的res数组
    res = res.concat(
        // 创建一个新的变换数组把所有data值加倍
        data.map(function (val) {
            return val * 2;
        })
    );
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
优化方法：

```
var res = [];
// response(..)从Ajax调用中取得结果数组
function response(data) {
    // 一次处理1000个
    var chunk = data.splice(0, 1000);
    // 添加到已有的res组
    res = res.concat(
        // 创建一个新的数组把chunk中所有值加倍
        chunk.map(function (val) {
            return val * 2;
        })
    );
    // 还有剩下的需要处理吗？
    if (data.length > 0) {
        // 异步调度下一次批处理
        setTimeout(function () {
            response(data);
        }, 0);
    }
}
// ajax(..)是某个库中提供的某个Ajax函数
ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
把数据集合放在最多包含1000条项目的块中。这样，我们就确保了“进程”运行事件会很短，即使这意味着需要更多的后续“进程”，因为事件循环队列的交替运行会提高站点/App的响应（性能）。
这里使用setTimeout(..0)(hack)进行异步调度，基本上它的意思就是“把这个函数插入到当前事件循环队列的结尾处”。

### 5. Promise.race([…])

*Promise.race(iterable)*方法返回一个promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。

一个*待定的* [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) 只要给定的迭代中的一个promise解决或拒绝，就采用第一个promise的值作为它的值，从而*异步*地解析或拒绝（一旦堆栈为空）。

Race函数返回一个Promise，它将与第一个传递的 promise 相同的完成方式被完成。它可以是完成（resolves），也可以是失败（rejects），这要取决于第一个完成的方式是两个中的哪个。
如果传的迭代是空的，则返回的 promise 将永远等待。
如果迭代包含一个或多个非承诺值和/或已解决/拒绝的承诺，则Promise.race将解析为迭代中找到的第一个值。
