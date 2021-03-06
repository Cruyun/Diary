# PostCSS

> PostCSS is a tool for transforming CSS with JS Plugins. These plugins can support variables and mixins, transpile future CSS syntax, inline images, and more

PostCSS 本身是一个功能比较单一的工具。它提供了一种方式用 JavaScript 代码来处理 CSS。它负责把 CSS 代码解析成抽象语法树结构（Abstract Syntax Tree，AST），再交由插件来进行处理。

常用的PostCSS插件：

 - px2rem: 当前移动端最常用的px转rem
 - autoprefixer: 自动为CSS添加浏览器前缀的插件
 - cssnext: 支持尚未成为CSS标准但特定可用的

### 如何在 Webpack中使用 PostCSS 

Webpack中使用postcss-loader 来执行插件处理。

```
const path = require('path');
const px2rem = require('postcss-px2rem');

module.exports = {
 context: path.join(__dirname, 'app'),
 entry: './app',
 output: {
   path: path.join(__dirname, 'dist'),
   filename: 'bundle.js'
 },
 module: {
   rules: [{
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              extractCSS: process.env.NODE_ENV === 'production',
              postcss: [px2rem({remUnit: 36})]
            }
          }]
 }
}
```

### 开发 PostCSS 插件

官方文档有较详细的[教程](https://github.com/postcss/postcss/blob/master/docs/writing-a-plugin.md)，同时也提供boilerPlate和guidelines，以及丰富的PostCSS API。

- 在项目文件夹的node_modules中创建插件文件夹，一般以`postcss-`为前缀。
- 进入插件文件夹，`npm init`并且创建`index.js`，我们的插件功能就在此实现。
- 安装postcss `npm install postcss --save`，你也可以安装你需要的其他依赖。
- `index.js`的基本代码如下：

```
var postcss = require('postcss');
 
module.exports = postcss.plugin('myplugin', function myplugin(options) {
    // css 代表的是表示 CSS AST 的对象，而 result 代表的是处理结果。
    return function (css, result) {
 
        options = options || {};
         
        // Processing code will be added here
 
    }
 
});
```

下面的代码示例使用 css 对象的 walkDecls 方法来遍历所有的“color”属性声明，并对“color”属性值进行检查。如果属性值为 black，就使用 result 对象的 warn 方法添加一个警告消息。

```
var postcss = require('postcss');
 
module.exports = postcss.plugin('postcss-checkcolor', 	function(options) {
 		return function(css, result) {
   			css.walkDecls('color', function(decl) {
     			if (decl.value == 'black') {
       		result.warn('No black color.', {decl: decl});
     }
   });
 };
})

```
