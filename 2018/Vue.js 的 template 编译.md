# Vue.js 的 template 编译

### 1.template会被编译成AST

createCompiler用以创建编译器，返回值是compile以及compileToFunctions。

- compile：一个编译器，它会将传入的template转换成对应的AST树、render函数以及staticRenderFns函数。

  - 合并option：将平台自有的option与传入的option进行合并
  - baseCompile，进行模板template的编译：首先会将模板template进行parse（用正则等方式解析template模板中的指令、class、style等数据）得到一个AST，再通过optimize优化（标记static静态节点，这是Vue在编译过程中的一处优化，后面当update更新界面时，会有一个patch的过程，diff算法会直接跳过静态节点，从而减少了比较的过程，优化了patch的性能），最后通过generate将 AST得到render以及staticRenderFns。
    

- compileToFunctions则是带缓存的编译器，同时staticRenderFns以及render函数会被转换成Funtion对象



### 2. AST会经过generate得到render函数

generate是将AST转化成render funtion字符串的过程，得到结果是render的字符串以及staticRenderFns字符串。

### 3. render的返回值是VNode，VNode则是Vue的虚拟DOM节点

render函数最后会返回一个VNode节点，在_update的时候，经过patch与之前的VNode节点进行比较，得出差异后将这些差异渲染到真实的DOM上。

---

原文地址：[聊聊Vue.js的template编译](https://zhuanlan.zhihu.com/p/29941103?group_id=962242605442191360)

 [VNode](https://github.com/answershuto/learnVue/blob/master/docs/VNode%E8%8A%82%E7%82%B9.MarkDown)