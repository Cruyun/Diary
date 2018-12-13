# JS执行环境与作用域链

函数调用都有与之相关的作用域和上下文。从根本上说，范围是基于函数(function-based)而上下文是基于对象(object-based)。换句话说，作用域是和每次函数调用时变量的访问有关，并且每次调用都是独立的。上下文总是关键字 this 的值，是调用当前可执行代码的对象的引用。

## 执行上下文栈(Execution Context Stack)

在ECMASscript中的代码有三种类型：global, function和eval。

每一种代码的执行都需要依赖自身的上下文。当然global的上下文可能涵盖了很多的function和eval的实例。函数的每一次调用，都会进入函数执行中的上下文,并且来计算函数中变量等的值。eval函数的每一次执行，也会进入eval执行中的上下文，判断应该从何处获取变量的值。

注意，一个function可能产生无限的上下文环境，因为一个函数的调用（甚至递归）都产生了一个新的上下文环境。

一系列活动的执行上下文从逻辑上形成一个栈。栈底总是全局上下文，栈顶是当前（活动的）执行上下文。当在不同的执行上下文间切换（退出的而进入新的执行上下文）的时候，栈会被修改（通过压栈或者退栈的形式）。

当JavaScript代码文件被浏览器载入后，默认最先进入的是一个全局的执行上下文。当在全局上下文中调用执行一个函数时，程序流就进入该被调用函数内，此时引擎就会为该函数创建一个新的执行上下文，并且将其压入到执行上下文堆栈的顶部。浏览器总是执行当前在堆栈顶部的上下文，一旦执行完毕，该上下文就会从堆栈顶部被弹出，然后，进入其下的上下文执行代码。这样，堆栈中的上下文就会被依次执行并且弹出堆栈，直到回到全局的上下文。

## 执行上下文(Execution Context)

也称为执行环节，一个执行的上下文可以抽象的理解为object。每一个执行的上下文都有一系列的属性（我们称为上下文状态），他们用来追踪关联代码的执行进度。主要有三个属性：变量对象(variable object)，this指针(this value)，作用域链(scope chain)。


### 函数的生命周期

函数的的生命周期分为创建和执行两个阶段。

1. 在函数创建阶段，JS解析引擎进行预解析，会将函数声明提前，同时将该函数放到全局作用域中或当前函数的上一级函数的局部作用域中。

2. 在函数执行阶段，JS引擎会将当前函数的局部变量和内部函数进行声明提前，然后再执行业务代码，当函数执行完退出时，释放该函数的执行上下文，并注销该函数的局部变量。

> AO：Activetion Object（活动对象）
VO：Variable Object（变量对象）

VO对应的是函数创建阶段，JS解析引擎进行预解析时，所有的变量和函数的声明，统称为Variable Object。该变量与执行上下文相关，知道自己的数据存储在哪里，并且知道如何访问。VO是一个与执行上下文相关的特殊对象，它存储着在上下文中声明的以下内容：

- 变量 (var, 变量声明);
- 函数声明 (FunctionDeclaration, 缩写为FD);
- 函数的形参

举个例子：

```
function add(a,b){
	var sum = a + b;
	function say(){
		alert(sum);
	}
	return sum;
}
// sum,say,a,b 组合的对象就是VO，不过该对象的值基本上都是undefined
```

AO对应的是函数执行阶段，当函数被调用执行时，会建立一个执行上下文，该执行上下文包含了函数所需的所有变量，该变量共同组成了一个新的对象就是Activetion Object。该对象包含了：

- 函数的所有局部变量
- 函数的所有命名参数
- 函数的参数集合
- 函数的this指向

举个例子：

```
function add(a,b){
	var sum = a + b;
	function say(){
		alert(sum);
	}
	return sum;
}

add(4,5);

//  我用JS对象来表示AO
//  AO = {
//	    this : window,
//	    arguments : [4,5],
//	    a : 4,
//	    b : 5,
//	    say : ,
//	    sum : undefined
//  }
```

### 作用域链


当代码在一个环境中执行时，会创建变量对象的一个作用域链（scope chain）来保证对执行环境有权访问的变量和函数的有序访问。作用域第一个对象始终是当前执行代码所在环境的变量对象（VO）。

```
function add(a,b){
	var sum = a + b;
	return sum;
}
```

假设函数是在全局作用域中创建的，在函数a创建的时候，它的作用域链填入全局对象,全局对象中有所有全局变量，此时的全局变量就是VO。此时的作用域链就是：

此时作用域链（Scope Chain）只有一级,就为Global Object

```
	scope(add) -> Global Object(VO)
	
	VO = {
		this : window,
		add : 
	}
```
如果是函数执行阶段，那么将其activation object（AO）作为作用域链第一个对象，第二个对象是上级函数的执行上下文AO，下一个对象依次类推。
add(4,5);
例如，调用add后的作用域链是：

此时作用域链（Scope Chain）有两级，第一级为AO，然后Global Object（VO）

```
	scope(add) -> AO -> VO

	AO = {
		this : window,
		arguments : [4,5],
		a : 4,
		b : 5,
		sum : undefined
	}
	
	VO = {
		this : window,
		add : 
	}
```

在函数运行过程中标识符的解析是沿着作用域链一级一级搜索的过程，从第一个对象开始，逐级向后回溯，直到找到同名标识符为止，找到后不再继续遍历，找不到就报错。

再举个例子：

```
var x = 10;
 
function foo() {
    var y = 20;
 
    function bar() {
        var z = 30;
 
        console.log(x + y + z);
    };
 
    bar()
};
 
foo();
```

上面代码的输出结果为”60″，函数bar可以直接访问”z”，然后通过作用域链访问上层的”x”和”y”。此时的作用域链为：
此时作用域链（Scope Chain）有三级，第一级为bar AO，第二级为foo AO,然后Global Object（VO）

```
	scope -> bar.AO -> foo.AO -> Global Object

	bar.AO = {
		z : 30,
		__parent__ : foo.AO
	}

	foo.AO = {
		y : 20,
		bar : ,
		__parent__ : 
	}
	
	Global Object = {
		x : 10,
		foo : ,
		__parent__ : null
	}
```
