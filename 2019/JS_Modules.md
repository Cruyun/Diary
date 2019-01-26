# JS 模块化

## ES6 模块
模块是以不同模式加载的JavaScript文件（与脚本相反，脚本以JavaScript工作的原始方式加载）。这种不同的模式是必要的，因为模块具有与脚本非常不同的语义：

1. 模块代码自动以严格模式运行，并且无法选择退出严格模式。
2. 在模块顶层创建的变量不会自动添加到共享全局范围。 它们仅存在于模块的顶级范围内。
3. 模块顶层的`this`是`undefined`。
4. 模块不允许在代码中使用 HTML 样式的注释（ JavaScript 早期浏览器时代的剩余功能）。
5. 模块必须导出模块外部代码可用的任何内容。
6. 模块可以从其他模块导入绑定。

### `export`命令和`import`命令

模块功能主要由两个命令构成：`export` 和 `import`。`export` 命令用于规定模块的对外接口，`import` 命令用于输入其他模块提供的功能。

`import` 和 `export` 命令只能在模块的顶层，不能在代码块之中（比如，在if代码块之中，或在函数之中）。

```
// export用法
// 单个变量
export var firstName = 'Michael';
export var lastName = 'Jackson';
export var year = 1958;

// 一次 export 一组变量
var firstName = 'Michael';
var lastName = 'Jackson';
var year = 1958;

export {firstName, lastName, year};

// 可以输出函数或类（class）
export function multiply(x, y) {
  return x * y;
};
```

`export` 输出的变量就是本来的名字，但是可以使用 `as` 关键字重命名。

```
function v1() { ... }
function v2() { ... }

export {
  v1 as streamV1,
  v2 as streamV2,
  v2 as streamLatestVersion
};
// 重命名后，v2可以用不同的名字输出两次。
```

使用 `export` 命令定义了模块的对外接口以后，其他 JS 文件就可以通过import命令加载这个模块。

```
// 大括号里面的变量名，必须与被导入模块（profile.js）对外接口的名称相同。
import {firstName, lastName, year} from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

除了指定加载某个输出值，还可以使用整体加载，即用星号（*）指定一个对象，所有输出值都加载在这个对象上面。

```
import * as circle from './circle';

console.log('圆面积：' + circle.area(4));
console.log('圆周长：' + circle.circumference(14));
```

### export default 命令

`export default` 命令，为模块指定默认输出。

```
// 它的默认输出是一个函数，export default命令只能使用一次
export default function () {
  console.log('foo');
}

// 其他模块加载该模块时，import命令可以为该匿名函数指定任意名字。模块名不需要加大括号

import customName from './export-default';
customName(); // 'foo'
```

本质上，`export default` 就是输出一个叫做 `default` 的变量或方法，然后系统允许你为它取任意名字。
---
在 ES6 之前，社区制定了一些模块加载方案，最主要的有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。

## CommonJs
Node.js是commonJS规范的主要实践者，它有四个重要的环境变量为模块化的实现提供支持：module、exports、require、global。实际使用时，用module.exports定义当前模块对外输出的接口（不推荐直接用exports），用require加载模块，浏览器中使用就需要用到 `Browserify` 解析了。

```
// a.js
module.exports = {
    a: 1
}
// or
exports.a = 1

// b.js
var module = require('./a.js')
module.a // -> log 1
```

在上述代码中，`module.exports` 和 `exports` 很容易混淆，让我们来看看大致内部实现

```
var module = require('./a.js')
module.a
// 这里其实就是包装了一层立即执行函数，这样就不会污染全局变量了，
// 重要的是 module 这里，module 是 Node 独有的一个变量
module.exports = {
    a: 1
}
// 基本实现
var module = {
  exports: {} // exports 就是个空对象
}
// 这个是为什么 exports 和 module.exports 用法相似的原因
var exports = module.exports
var load = function (module) {
    // 导出的东西
    var a = 1
    module.exports = a
    return module.exports
};
再来说说 module.exports 和 exports，用法其实是相似的，但是不能对 exports 直接赋值，不会有任何效果。
```



## AMD
AMD 是由 `RequireJS` 提出的，AMD规范采用 _异步方式_ 加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。这里介绍用 `require.js` 实现AMD规范的模块化：用 `require.config()` 指定引用路径等，用 `define()` 定义模块，用 `require()` 加载模块


```
// AMD
// 如果我们定义的模块本身也依赖其他模块,那就需要将它们放在[]中作为define()的第一参数。
define(['./a', './b'], function(a, b) {
    a.do()
    b.do()
})
define(function(require, exports, module) {   
    var a = require('./a')  
    a.doSomething()   
    var b = require('./b')
    b.doSomething()
})

require.config({
  baseUrl: "js/lib",
  paths: {
    "jquery": "jquery.min",  //实际路径为js/lib/jquery.min.js
    "underscore": "underscore.min",
  }
});

// 引用模块，将模块放在[]内
require(['jquery', 'math'],function($, math){
  var sum = math.add(10,20);
  $("#sum").html(sum);
});

```

---
## ES6 模块与 CommonJS 的区别
ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。

ES6 模块跟 CommonJS 模块的不同，主要有以下两个方面：
1.  ES6 模块输出的是值的引用，输出接口动态绑定，而 CommonJS 输出的是值的拷贝。
- CommonJS 模块重复引入的模块并不会重复执行，再次获取模块直接获得暴露的 module.exports 对象
如果你要处处获取到模块内的最新值的话，也可以你每次更新数据的时候每次都要去更新 module.exports 上的值
如果你暴露的 module.exports 的属性是个对象，那就不存在这个问题了

CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，ES6 的import有点像 Unix 系统的“符号连接”，原始值变了，import加载的值也会跟着变。因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。

2. ES6 模块编译时执行，而 CommonJS 模块总是在运行时加载。
- import 命令会被 JavaScript 引擎静态分析，优先于模块内的其他内容执行。
- export 命令会有变量声明提前的效果。

- 运行时加载: CommonJS 模块就是对象；即在输入时是先加载整个模块，生成一个对象，然后再从这个对象上面读取方法，这种加载称为“运行时加载”。

- 编译时加载: ES6 模块不是对象，而是通过 export 命令显式指定输出的代码，import时采用静态命令的形式。即在import时可以指定加载某个输出值，而不是加载整个模块，这种加载称为“编译时加载”。

从理解上，`require` 是赋值过程，`import` 是解构过程，当然，`require` 也可以将结果解构赋值给一组变量，但是`import` 在遇到 `default` 时，和 `require` 则完全不同：`var $ = require('jquery’);` 和 `import $ from 'jquery’` 是完全不同的两种概念。

CommonJS 模块是同步导入，因为用于服务端，文件都在本地，同步导入即使卡住主线程影响也不大。而 ES6 模块是异步导入，因为用于浏览器，需要下载文件，如果也采用同步导入会对渲染有很大影响。

---
参考及推荐阅读：

- [深入理解 ES6 模块机制 - 知乎](https://zhuanlan.zhihu.com/p/33843378?group_id=947910345524752384)
- [ECMAScript 6 入门](http://es6.ruanyifeng.com/￼#docs/module#￼export-%E5%91%BD%E4%BB%A4)
- [Understanding ECMAScript 6](https://leanpub.com/understandinges6/read/#leanpub-auto-encapsulating-code-with-modules)
- [前端模块化：CommonJS,AMD,CMD,ES6 - 掘金](https://juejin.im/post/5aaa37c8f265da23945f365c)
- [Node中没搞明白require和import，你会被坑的很惨 - 腾讯Web前端 IMWeb 团队社区 | blog | 团队博客](https://imweb.io/topic/582293894067ce9726778be9)