# CSS Normalize & CSS Reset

- [CSS Reset](https://meyerweb.com/eric/tools/css/reset/) 删除所有内置浏览器样式。 标准元素如H1-6，p，strong，em等等最终看起来完全相同，完全没有decoration。 然后你应该自己添加所有decoration。

- [Normalize.css](https://github.com/necolas/normalize.css/)   旨在使浏览器内置的浏览器样式保持一致。 像H1-6这样的元素将在浏览器中以一致的方式显示为粗体，更大等等。 然后，用户只添加自己的设计需求的decoration。

具体来说，Normalize.css的目标如下：

保留有用的浏览器默认值而不是删除它们。
规范化各种HTML元素的样式。
纠正错误和常见的浏览器不一致。
通过微妙的改进提高可用性。
使用注释和详细文档解释代码。
它支持各种浏览器（包括移动浏览器），并包括标准化HTML5元素，排版，列表，嵌入内容，表单和表格的CSS。

尽管该项目基于规范化原则，但它使用实用默认值，因为它们更受欢迎

### Normalize.css 的特点

1. Normalize.css保留有用的默认值
2. Normalize.css纠正了常见的错误
它修复了常见的桌面和移动浏览器错误，这些错误超出了重置范围。这包括HTML5元素的显示设置，校正 font-size预格式文本，IE9中的SVG溢出以及浏览器和操作系统中许多与表单相关的错误。

```
/**
 * 1. Addresses appearance set to searchfield in S5, Chrome
 * 2. Addresses box-sizing set to border-box in S5, Chrome (include -moz to future-proof)
 */

input[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  -moz-box-sizing: content-box;
  -webkit-box-sizing: content-box; /* 2 */
  box-sizing: content-box;
}

/**
 * Removes inner padding and search cancel button in S5, Chrome on OS X
 */

input[type="search"]::-webkit-search-decoration,
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}
```

3. Normalize.css不会使调试工具混乱
4. Normalize.css是模块化的，可以按需采用
5. Normalize.css有较详细的文档

参考及推荐阅读：

- [CSS Normalize & CSS Reset – Daphne Watson – Medium](https://medium.com/@DaphneWatson/css-normalize-css-reset-which-one-do-you-prefer-6e8cc593ac41)
- [About normalize.css – Nicolas Gallagher](http://nicolasgallagher.com/about-normalize-css/)
- [What is the difference between Normalize.css and Reset CSS? - Stack Overflow](https://stackoverflow.com/questions/6887336/what-is-the-difference-between-normalize-css-and-reset-css)