# ES6 箭头函数(arrow function)

## 语法

箭头函数是 ES6中引入的一种编写函数的新语法，当只需一个参数的简单函数时，可以使用箭头函数。

```
 // ES5
 var selected = allJobs.filter(function (job) {
      return job.isSelected();
    });
// ES6
    var selected = allJobs.filter(job => job.isSelected());
    
```

标准语法如下：

```
(参数1, 参数2, …, 参数N) => { 函数声明 }
(参数1, 参数2, …, 参数N) => 表达式（单一）
//相当于：(参数1, 参数2, …, 参数N) =>{ return 表达式; }

// 当只有一个参数时，圆括号是可选的：
(单一参数) => {函数声明}
单一参数 => {函数声明}

// 没有参数的函数应该写成一对圆括号。
() => {函数声明}


// 如果写一个接受多重参数的函数，需要用小括号包含参数列表：

// ES5
    var total = values.reduce(function (a, b) {
      return a + b;
    }, 0);
// ES6
    var total = values.reduce((a, b) => a + b, 0);
    
```

也就是 标识符=>表达式，无需输入 function 和 return，有时也可省略一些小括号、大括号和分号。

### 高级语法

```
//加括号的函数体返回对象字面表达式：
参数=> ({foo: bar})

// 创建普通对象时，需要将对象包裹在小括号内
var chewToys = puppies.map(puppy => {});   //  undefined
var chewToys = puppies.map(puppy => ({})); //
    
//支持剩余参数（将一个不定数量的参数表示为一个数组)和默认参数
(参数1, 参数2, ...rest) => {函数声明}
(参数1 = 默认值1,参数2, …, 参数N = 默认值N) => {函数声明}

//同样支持参数列表解构
let f = ([a, b] = [1, 2], {x: c} = {x: a + b}) => a + b + c;
f();  // 6
```

除了表达式外，箭头函数还可以包含一个块语句。对于使用了 promise 来说可以简化代码：`}).then(function(result){}` 可简写成`}).then(result => {})`

**使用块语句的箭头函数不会自动返回值，需要使用 return 语句**

## 箭头函数与普通函数的区别

### 1. 箭头函数没有自己的`this`值，其`this`继承自外围作用域(lexical scope)

我们有时候会用一个临时变量 self将外部的 this 值导入内部函数，或者是用`.bind(this)`。

在ES6中，使用箭头函数：

```
{
      ...
      addAll(pieces) {
        _.each(pieces, piece => this.add(piece));
      },
      ...
    }
```
>“箭头函数”的this，总是指向定义时所在的对象，而不是运行时所在的对象。

### 2. 箭头函数不会获取其 arguments 对象
arguments对象是所有（非箭头）函数中都可用的局部变量


```
var arguments = 42;
var arr = () => arguments;

arr(); // 42

function foo() {
  var f = (i) => arguments[0]+i; 
  // foo函数的间接参数绑定
  return f(2);
}

foo(1); // 3
```

### 3.箭头函数不能用作构造器，和 new一起用会抛出错误

```
var Foo = () => {};
var foo = new Foo(); // TypeError: Foo is not a constructor
```

### 4.没有prototype属性

```
var Foo = () => {};
console.log(Foo.prototype); // undefined
```
