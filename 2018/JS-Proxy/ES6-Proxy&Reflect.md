# ES6: Proxy and Reflect

## Reflect
Reflect是一个全局的内置对象（像 JSON 和 Math)，他提供拦截 JS 操作的方法。
>与大多数全局对象不同，Reflect没有构造函数。你不能将其与一个new运算符一起使用，或者将Reflect对象作为一个函数来调用。Reflect的所有属性和方法都是静态的（就像Math对象）。

为什么我不使用对象的内置方法，例如 Object.keys, Object.getOwnPropertyNames 呢？

1. Reflect 的方法不仅适用于对象，例如`Reflect.apply`的参数是函数。调用`Object.apply(myFunction)`会显得很奇怪；
2. 有一个单独的对象来存放这些方法可以保持JavaScript其余部分干净，而不是在整个构造函数和原型中加入Reflection方法；
3. `typeof`，`instanceof`和`delete`已经作为 Reflection 的运算符存在，添加这样的新关键字不仅对开发人员来说很麻烦，而且也是向后兼容的噩梦，并且了增加保留字的数量。

Reflect对象的**设计目的**:

1. 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上。现阶段，某些方法同时在Object和Reflect对象上部署，未来的新方法将只部署在Reflect对象上。也就是说，从Reflect对象上可以拿到语言内部的方法。

2. 修改某些Object方法的返回结果，让其变得更合理。比如，Object.defineProperty(obj, name, desc)在无法定义属性时，会抛出一个错误，而Reflect.defineProperty(obj, name, desc)则会返回false。


```
/ 老写法
try {
  Object.defineProperty(target, property, attributes);
  // success
} catch (e) {
  // failure
}

// 新写法
if (Reflect.defineProperty(target, property, attributes)) {
  // success
} else {
  // failure
}
```

3. 让Object操作都变成函数行为。某些Object操作是命令式，比如name in obj和delete obj[name]，而Reflect.has(obj, name)和Reflect.deleteProperty(obj, name)让它们变成了函数行为。

4. Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法。这就让Proxy对象可以方便地调用对应的Reflect方法，完成默认行为，作为修改行为的基础。也就是说，不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为。


--- 

## Proxy

```
const someObject = { prop1: 'Awesome' };
console.log(someObject.prop1);  // Awesome
console.log(someObject.prop2);  // undefined
```
假设我有以上代码，someObject对象只有 prop1属性，当我尝试去获取 prop2时，必定会得到 undefined。假如想实现当读取不存在的属性不抛出 undefined 而是其他提醒时，可以使用 Proxy。

通常我们获取一个对象的属性，是这样的：

![proxy1.jpeg](https://upload-images.jianshu.io/upload_images/4938344-a099bbfe0b7c3bde.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

使用 proxy：

![proxy2.png](https://upload-images.jianshu.io/upload_images/4938344-e84aac7f07ef8bfe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。


### 术语
- **target**

 用Proxy包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- **handler**

 一个对象，其属性是当执行一个操作时定义代理的行为的函数。
- **trap**
 
 拦截的操作。 例如，访问一个属性称为get trap。 将值设置为属性称为set trap。 从对象中删除属性称为delete Property trap。

### 创建一个 proxy 对象

```
const proxiedObject = new Proxy(initialObj, handler);
```
调用Proxy构造函数，new Proxy()将返回一个对象，不仅包含了initialObj里的值，而且其基本操作（如get 和 set）现在可以通过handler对象来指定一些自定义逻辑。

```
const handler = {
    get: function() {
        console.log('A value has been accessed');
    }
}

const initialObj = {
    id: 1,
    name: 'Foo Bar'
}

const proxiedObj = new Proxy(initialObj, handler);

console.log(proxiedObj.name);
```

### handler 中使用 Reflect 对象
每一个Proxy对象的拦截操作（get、delete、has），内部都调用对应的Reflect方法，保证原生行为能够正常执行。有了Reflect对象以后，很多操作会更易读。


```
  const handler = {
    get(target, property, receiver) {
      onChangeFunction();
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value) {
      onChangeFunction();
      return Reflect.set(target, property, value);
    },
    deleteProperty(target, property) {
      onChangeFunction();
      return Reflect.deleteProperty(target, property);
    }
  };
const proxyObj =  new Proxy(objToWatch, handler);

```


为什么建议在 proxy 的 handler 中使用Reflect 对象可以戳[这里](https://github.com/tvcutsem/harmony-reflect/wiki)

### 使用
利用 proxy，我们可以实现转发代理、验证、扩展构造函数等，还可以实现观察者模式。


---
推荐阅读：

- [Understanding JavaScript Proxies by Examining on-change Library](https://codeburst.io/understanding-javascript-proxies-by-examining-on-change-library-f252eddf76c2)
- [Reflect 内置函数的详细用法与示例](https://www.keithcirkel.co.uk/metaprogramming-in-es6-part-2-reflect/)
- [MDN Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [MDN Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [使用 Proxy 实现观察者模式](http://es6.ruanyifeng.com/#docs/reflect#%E5%AE%9E%E4%BE%8B%EF%BC%9A%E4%BD%BF%E7%94%A8-Proxy-%E5%AE%9E%E7%8E%B0%E8%A7%82%E5%AF%9F%E8%80%85%E6%A8%A1%E5%BC%8F)
- [Proxy详解](https://www.keithcirkel.co.uk/metaprogramming-in-es6-part-3-proxies/)