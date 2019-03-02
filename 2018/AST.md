## [JavaScript 语法树与代码转化](https://zhuanlan.zhihu.com/p/28054817)

### 抽象语法树（Abstract Syntax Tree, AST）

抽象语法树（Abstract Syntax Tree）也称为AST语法树，指的是源代码语法所对应的树状结构。也就是说，对于一种具体编程语言下的源代码，通过构建语法树的形式将源代码中的语句映射到树中的每一个节点上。 

可以使用 [AST Explorer](https://astexplorer.net/) 这个工具进行在线预览与编辑。

### 语法树的作用

程序代码本身可以被映射成为一棵语法树，而通过操纵语法树，我们能够精准的获得程序代码中的某个节点。抽象语法树可以用于编译器、IDE、压缩优化代码等


**自定义插件**
Babel 支持以观察者（Visitor）模式定义插件，我们可以在 visitor 中预设想要观察的 Babel 结点类型，然后进行操作。
也就是遍历AST， 通过 Visitor 修改语法树，最后插件再把 AST 序列化变成字符串。

### 常用操作
- 遍历
- 判断某个节点是否为指定类型（内置的type对象
- 替换、删除、插入节点

通常通过工具的API，我们可以对AST进行上述操作，例如[PostCSS API Doc](http://api.postcss.org/)