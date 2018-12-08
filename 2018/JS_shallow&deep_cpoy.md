# JS浅拷贝与深拷贝

## 变量赋值
### 按值传递
Javascript 中永远是按值传递（pass-by-value），只不过当我们传递的是某个对象的引用时，这里的值指的是对象的引用。按值传递中函数的形参是被调用时所传实参的副本。修改形参的值并不会影响实参。而按引用传递（pass-by-reference）时，函数的形参接收实参的隐式引用，而不再是副本。这意味着函数形参的值如果被修改，实参也会被修改。同时两者指向相同的值。


```
function changeStuff(a, b, c)
{
  a = a * 10;
  b.item = "changed";
  c = {item: "changed"};
}

var num = 10;
var obj1 = {item: "unchanged"};
var obj2 = {item: "unchanged"};

changeStuff(num, obj1, obj2);

console.log(num);
console.log(obj1.item);    
console.log(obj2.item);

// 输出结果
10
changed
unchanged
```

Javascript 按值传递就表现于在内部修改了 c 的值但是并不会影响到外部的 obj2 变量。如果我们更深入地来理解这个问题，Javascript 对于对象的传递则是按共享传递的（pass-by-sharing，也叫按对象传递、按对象共享传递）。

该求值策略的重点是：调用函数传参时，函数接受对象实参引用的副本(既不是按值传递的对象副本，也不是按引用传递的隐式引用)。 它和按引用传递的不同在于：在共享传递中对函数形参的赋值，不会影响实参的值。

按共享传递的直接表现就是上述代码中的 obj1，当我们在函数内修改了 b 指向的对象的属性值时，我们使用 obj1 来访问相同的变量时同样会得到变化后的值。


## Shallow Copy: 浅拷贝

顶层属性遍历

浅拷贝是指复制对象的时候，指对第一层键值对进行独立的复制。一个简单的实现如下：

```
// 浅拷贝实现
function shadowCopy(target, source){ 
if( !source || typeof source !== 'object'){
return;
    }
    // 这个方法有点小trick，target一定得事先定义好，不然就不能改变实参了。
       // 具体原因解释可以看参考资料中 JS是值传递还是引用传递
if( !target || typeof target !== 'object'){
return;
    }  
    // 这边最好区别一下对象和数组的复制
for(var key in source){
if(source.hasOwnProperty(key)){
            target[key] = source[key];
        }
    }
}

//测试例子
var arr = [1,2,3];
var arr2 = [];
shadowCopy(arr2, arr);
console.log(arr2);
//[1,2,3]

var today = {
    weather: 'Sunny',
    date: {
        week: 'Wed'
    } 
}

var tomorrow = {};
shadowCopy(tomorrow, today);
console.log(tomorrow);
// Object {weather: "Sunny", date: Object}
```

### Object.assign

Object.assign() 方法可以把任意多个的源对象所拥有的自身可枚举属性拷贝给目标对象，然后返回目标对象。Object.assign 方法只会拷贝源对象自身的并且可枚举的属性到目标对象身上。注意，对于访问器属性，该方法会执行那个访问器属性的 getter 函数，然后把得到的值拷贝给目标对象，如果你想拷贝访问器属性本身，请使用 `Object.getOwnPropertyDescriptor() `和`Object.defineProperties() `方法。

注意，字符串类型和 symbol 类型的属性都会被拷贝。

注意，在属性拷贝过程中可能会产生异常，比如目标对象的某个只读属性和源对象的某个属性同名，这时该方法会抛出一个 TypeError 异常，拷贝过程中断，已经拷贝成功的属性不会受到影响，还未拷贝的属性将不会再被拷贝。

注意， Object.assign 会跳过那些值为 null 或 undefined 的源对象。

`Object.assign(target, ...sources)`

例子：浅拷贝一个对象

```
var obj = { a: 1 };
var copy = Object.assign({}, obj);
console.log(copy); // { a: 1 }
```

例子：合并若干个对象

```
var o1 = { a: 1 };
var o2 = { b: 2 };
var o3 = { c: 3 };

var obj = Object.assign(o1, o2, o3);
console.log(obj); // { a: 1, b: 2, c: 3 }
console.log(o1);  // { a: 1, b: 2, c: 3 }, 注意目标对象自身也会改变。
```

例子：拷贝 symbol 类型的属性

```
var o1 = { a: 1 };
var o2 = { [Symbol("foo")]: 2 };
var obj = Object.assign({}, o1, o2);
console.log(obj); // { a: 1, [Symbol("foo")]: 2 }
```


例子：继承属性和不可枚举属性是不能拷贝的

```
var obj = Object.create({foo: 1}, { // foo 是个继承属性。
    bar: {
        value: 2  // bar 是个不可枚举属性。
    },
    baz: {
        value: 3,
        enumerable: true  // baz 是个自身可枚举属性。
    }
});

var copy = Object.assign({}, obj);
console.log(copy); // { baz: 3 }
```

例子：原始值会被隐式转换成其包装对象

```
var v1 = "123";
var v2 = true;
var v3 = 10;
var v4 = Symbol("foo")

var obj = Object.assign({}, v1, null, v2, undefined, v3, v4); 

// 源对象如果是原始值，会被自动转换成它们的包装对象，
// 而 null 和 undefined 这两种原始值会被完全忽略。
// 注意，只有字符串的包装对象才有可能有自身可枚举属性。
console.log(obj); // { "0": "1", "1": "2", "2": "3" }
```

例子：拷贝属性过程中发生异常

```
var target = Object.defineProperty({}, "foo", {
    value: 1,
    writeable: false
}); // target 的 foo 属性是个只读属性。

Object.assign(target, {bar: 2}, {foo2: 3, foo: 3, foo3: 3}, {baz: 4});
// TypeError: "foo" is read-only
// 注意这个异常是在拷贝第二个源对象的第二个属性时发生的。

console.log(target.bar);  // 2，说明第一个源对象拷贝成功了。
console.log(target.foo2); // 3，说明第二个源对象的第一个属性也拷贝成功了。
console.log(target.foo);  // 1，只读属性不能被覆盖，所以第二个源对象的第二个属性拷贝失败了。
console.log(target.foo3); // undefined，异常之后 assign 方法就退出了，第三个属性是不会被拷贝到的。
console.log(target.baz);  // undefined，第三个源对象更是不会被拷贝到的。
```

#### 使用 [].concat 来复制数组

同样类似于对于对象的复制，我们建议使用 `[].concat` 来进行数组的深复制:

```
var list = [1, 2, 3];
var changedList = [].concat(list);
changedList[1] = 2;
list === changedList; // false
```

同样的，concat方法也只能保证一层深复制:

```
> list = [[1,2,3]]
[ [ 1, 2, 3 ] ]
> new_list = [].concat(list)
[ [ 1, 2, 3 ] ]
> new_list[0][0] = 4
4
> list
[ [ 4, 2, 3 ] ]
```

### 浅拷贝的缺陷
不过需要注意的是，assign是浅拷贝，或者说，它是一级深拷贝，举两个例子说明：

```
const defaultOpt = {
    title: {
        text: 'hello world',
        subtext: 'It\'s my world.'
    }
};

const opt = Object.assign({}, defaultOpt, {
    title: {
        subtext: 'Yes, your world.'
    }
});

console.log(opt);

// 预期结果
{
    title: {
        text: 'hello world',
        subtext: 'Yes, your world.'
    }
}
// 实际结果
{
    title: {
        subtext: 'Yes, your world.'
    }
}
```

上面这个例子中，对于对象的一级子元素而言，只会**替换引用**，而不会动态的添加内容。那么，其实assign并没有解决对象的引用混乱问题，参考下下面这个例子：

```
const defaultOpt = {
    title: {
        text: 'hello world',
        subtext: 'It\'s my world.'
    } 
};

const opt1 = Object.assign({}, defaultOpt);
const opt2 = Object.assign({}, defaultOpt);
opt2.title.subtext = 'Yes, your world.';

console.log('opt1:');
console.log(opt1);
console.log('opt2:');
console.log(opt2);

// 结果
opt1:
{
    title: {
        text: 'hello world',
        subtext: 'Yes, your world.'
    }
}
opt2:
{
    title: {
        text: 'hello world',
        subtext: 'Yes, your world.'
    }
}
```

## DeepCopy: 深拷贝

#### 递归属性遍历

一般来说，在Javascript中考虑复合类型的深层复制的时候，往往就是指对于Date、Object与Array这三个复合类型的处理。我们能想到的最常用的方法就是先创建一个空的新对象，然后递归遍历旧对象，直到发现基础类型的子节点才赋予到新对象对应的位置。不过这种方法会存在一个问题，就是Javascript中存在着神奇的原型机制，并且这个原型会在遍历的时候出现，然后原型不应该被赋予给新对象。那么在遍历的过程中，我们应该考虑使用`hasOenProperty`方法来过滤掉那些继承自原型链上的属性：

```
function clone(obj) {
var copy;

    // Handle the 3 simple types, and null or undefined
if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
return copy;
    }

    // Handle Array
if (obj instanceof Array) {
        copy = [];
for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
return copy;
    }

    // Handle Object
if (obj instanceof Object) {
        copy = {};
for (var attr in obj) {
if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
return copy;
    }

throw new Error("Unable to copy obj! Its type isn't supported.");
}
```

调用如下：

```
// This would be cloneable:
var tree = {
    "left"  : { "left" : null, "right" : null, "data" : 3 },
    "right" : null,
    "data"  : 8
};

// This would kind-of work, but you would get 2 copies of the 
// inner node instead of 2 references to the same copy
var directedAcylicGraph = {
    "left"  : { "left" : null, "right" : null, "data" : 3 },
    "data"  : 8
};
directedAcyclicGraph["right"] = directedAcyclicGraph["left"];

// Cloning this would cause a stack overflow due to infinite recursion:
var cylicGraph = {
    "left"  : { "left" : null, "right" : null, "data" : 3 },
    "data"  : 8
};
cylicGraph["right"] = cylicGraph;
```

另一个原生实现例子：

```
function deepClone (obj) {
  if (Array.isArray(obj)) {
    return obj.map(deepClone)
  } else if (obj && typeof obj === 'object') {
    var cloned = {}
    var keys = Object.keys(obj)
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      cloned[key] = deepClone(obj[key])
    }
    return cloned
  } else {
    return obj
  }
}
```

#### 利用 JSON 深拷贝

`JSON.parse(JSON.stringify(obj));`

对于一般的需求是可以满足的，但是它有缺点。下例中，可以看到JSON复制会忽略掉值为undefined以及函数表达式。

```
var obj = {
    a: 1,
    b: 2,
    c: undefined,
    sum: function() { return a + b; }
};

var obj2 = JSON.parse(JSON.stringify(obj));
console.log(obj2);
//Object {a: 1, b: 2}
```

但是该方法也是有局限性的：

1. 会忽略 undefined
2. 会忽略 symbol
3. 不能序列化函数
4. 不能解决循环引用的对象

```
let obj = {
  a: 1,
  b: {
    c: 2,
    d: 3,
  },
}
obj.c = obj.b
obj.e = obj.a
obj.b.c = obj.c
obj.b.d = obj.b
obj.b.e = obj.b.c
let newObj = JSON.parse(JSON.stringify(obj))
console.log(newObj)
```

