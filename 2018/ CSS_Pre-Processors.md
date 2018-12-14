# CSS Pre-Processors：Sass & Less & Stylus
## Variables
使用预处理器，可以在 CSS 中声明变量，比如 "color”,  “width", "font-size", "font-family", "borders" 等等。

SASS中声明变量用$， LESS使用@，并且使用 ： 赋值；
Stylus不用前缀，使用 = 赋值


```
// Sass
$font-size: 16px;

div {
    font-size: $font-size;
}
// Less
@font-size: 16px;

div {
    font-size: @font-size;
}

// Stylus
font-size = 16px

div
    font-size font-size
```

LESS 不仅可以声明CSS 规则，还可以用于声明内部选择器、属性名、 URLs, 和 @import 语句。

```
/* LESS */

@uploads: “../wp-content/uploads/”;
header {
  background-image: url(“@{uploads}/2018/03/bg-image.jpg);
}
```

## Nesting
在使用子选择器时，CSS缺乏可视化层次结构，必须在单独的行中编写选择器及其组合。 预处理器嵌套提供了HTML中的可视化层次结构，并提高了可读性。 

```
$link-color: #999;
$link-hover: #229ed3;

ul {
    margin: 0;
    li {
        float: left;
    }
    a {
        color: $link-color;
        &:hover {
            color: $link-hover;
        }
    }
}
```

## Mixins
Mixins是一组定义，可根据某些参数或静态规则进行编译，让我们在整个代码中重用一组相关的样式规则。 

```
/* SCSS */
@mixin card($width, $height, $bg, $border) {
  width: $width;
  height: $height;
  background: $bg;
  border: $border;
}
```

LESS mixins的工作方式与Sass mixins类似。 LESS还为我们提供了在LESS中实现基本条件逻辑的特定保护Mixins。 例如，以下代码示例定义了两种不同的字体颜色（黑色和白色），并根据背景的亮度应用它们。 （该示例还使用了`lightness()` LESS函数。）

```
/* LESS */

.text-color (@bg-color) when (lightness(@bg-color) >= 50%) {
  color: black;
}
.text-color (@bg-color) when (lightness(@bg-color) < 50%) {
  color: white;
}
.text-color (@bg-color) {
  background-color: @bg-color;
}
.card-1 {
  .text-color (yellow);
}
.card-2 {
  .text-color (darkblue);
}

/* Compiled CSS */

.card-1 {
  color: black;
  background-color: yellow;
}
.card-2 {
  color: white;
  background-color: darkblue;
}
```

## Extends
Extends 对于与选择器共享通用定义非常有用，不是将其复制。所有Extends选择器都在编译的CSS中进行分组。 SASS Extends 包含其子选择器和继承属性的 Extends 选择器的每个实例。 但是，在LESS中，可以通过向extend方法添加“all”属性来选择扩展选择器的每个实例，或者只选择主实例。 Extends也是chainable 。

```
// Sass
.block { margin: 10px 5px; }

p {
  @extend .block;
  border: 1px solid #eee;
}

ul, ol {
  @extend .block;
  color: #333;
  text-transform: uppercase;
}

// Less
.block { margin: 10px 5px; }

p {
  &:extend(.block);
  border: 1px solid #eee;
}

ul, ol {
  &:extend(.block);
  color: #333;
  text-transform: uppercase;
}

// Stylus
.block
    margin 10px 5px

p
    @extend .block
    border 1px solid #eee

ul
ol
    @extend .block
    color #333
    text-transform uppercase
```

## If/Else Statements
控制指令和表达式有助于根据匹配的条件或变量构建类似的样式定义。 SASS和Stylus支持正常的if / else条件。 但是在LESS中，你可以通过CSS Guards实现。

```
// Sass
@if lightness($color) > 30% {
    background-color: black;
}

@else {
    background-color: white;
}

// Less
.mixin (@color) when (lightness(@color) > 30%) {
    background-color: black;
}
.mixin (@color) when (lightness(@color) =<; 30%) {
    background-color: white;
}

// Stylus
if lightness(color) > 30%
    background-color black
else
    background-color white
```

## Loops
Loops 遍历数组或创建一系列样式（如Grid 宽度）时。 就像在if / else情况下一样，LESS使用CSS Guards和递归mixins进行循环。

```
// Sass
@for $i from 1px to 3px {
    .border-#{i} {
        border: $i solid blue;
    }
}
// Less
.loop(@counter) when (@counter > 0){
    .loop((@counter - 1));

    .border-@{counter} {
        border: 1px * @counter solid blue;
    }
}
// Stylus
for num in (1..3)
    .border-{num}
        border 1px * num solid blue
```

## Math
Math 运算可用于标准算术或单位转换。 SASS和Stylus支持不同单位之间的算术运算。 除了简单的数学运算之外，预处理器还具有复杂的数学支持，例如上限，舍入，在列表中获得最小值或最大值等。

```
// Sass
1cm * 1em => 1 cm * em
2in * 3in => 6 in * in
(1cm / 1em) * 4em => 4cm
2in + 3cm + 2pc => 3.514in
3in / 2in => 1.5
```

Reference：

- [An Introduction to CSS Pre-Processors: SASS, LESS and Stylus | HTML Mag](https://htmlmag.com/article/an-introduction-to-css-preprocessors-sass-less-stylus)
- [Popular CSS Preprocessors With Examples: Sass, Less & Stylus ·  Raygun Blog](https://raygun.com/blog/css-preprocessors-examples/)