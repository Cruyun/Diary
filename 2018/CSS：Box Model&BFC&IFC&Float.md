# CSS：Box Model & BFC & IFC & Float
## 盒模型
content box + padding box + border box + margin box
- IE5.5(怪异模式)采用IE盒子模型，其它将使用W3C标准盒子模型。

```
width = content-width + padding-width + border-width
height = content-height + padding-height + border-height
```

- 标准盒子模型

```
width = content-width
height = content-height
```

### box-sizing属性

box-sizing有三个值：content-box/border-box/inherit

  1. content-box——默认值，采用Standard box model
  2. border-box——采用IE box model
  3. inherit——继承父元素属性值

## BFC—— “块级格式化上下文”
在 BFC 中，盒子从顶端开始垂直地一个接一个地排列，两个盒子之间的垂直的间隙是由他们的 margin 值所决定的。在一个 BFC 中，两个相邻的块级盒子的垂直外边距会产生折叠。在 BFC 中，每个盒子的左外边框紧挨着包含块的左边框，从右到左的格式，则为紧挨右边框。即使存在浮动也是这样的，尽管一个盒子的边框会由于浮动而收缩，除非这个盒子的内部创建了一个新的 BFC 浮动，盒子本身将会变得更窄。

**如何创造BFC”**
1. 根元素；
2. float属性不为none；
3. position为absolute或fixed；
4. display为inline-block, flex, 或者inline-flex；
5. overflow不为visible；

## IFC——”行内格式化上下文“
行级盒子的content box的高/宽根本就不是通过height/width来设置的。
  
- content box/area的高由font-size决定的；
 - content box/area的宽等于其子行级盒子的外宽度(margin+border+padding+content width)之和。

## 置换元素
`<img>|<input>|<button>|<select>|<textarea>|<label>`

他们区别一般 inline 元素是：这些元素拥有内在尺寸,他们可以设置 width/height 属性。他们的性质同设置了 `display:inline-block` 的元素一致。上述六个标签在现代浏览器中即为天生的 inline-block 元素。

## 块级元素和行内元素
行内元素与块级元素的三个**区别**

1.  行内元素会在一条直线上排列（默认宽度只与内容有关），都是同一行的，水平方向排列。
块级元素各占据一行（默认宽度是它本身父容器的100%（和父元素的宽度一致），与内容无关），垂直方向排列。块级元素从新行开始，结束接着一个断行。
2. 块级元素可以包含行内元素和块级元素。行内元素不能包含块级元素，只能包含文本或者其它行内元素。
3. 行内元素与块级元素属性的不同，主要是盒模型属性上：行内元素设置width无效，height无效(可以设置line-height)，margin上下无效，padding上下无效

**1. 行内元素**

* b, big, i, small, tt
* abbr, acronym, cite, code, dfn, em, kbd, strong, samp, var
* a, bdo, br, img, map, object, q, script, span, sub, sup
* button, input, label, select, textarea

**2.块元素 (block element)**

* address - 地址
* blockquote - 块引用
* center - 举中对齐块
* dir - 目录列表
* div - 常用块级容易，也是 css layout 的主要标签
* dl - 定义列表
* fieldset - form控制组
* form - 交互表单
* h3-大标题
* h4 - 副标题
* h3 - 3级标题
* h4 - 4级标题
* h5 - 5级标题
* h6 - 6级标题
* hr - 水平分隔线
* isindex - input prompt
* menu - 菜单列表
* noframes - frames可选内容，（对于不支持 frame 的浏览器显示此区块内容
* noscript - ）可选脚本内容（对于不支持 script 的浏览器显示此内容）
* ol - 排序表单
* p - 段落
* pre - 格式化文本
* table - 表格
* ul - 非排序列表


## z-index
## 浮动
float，顾名思义就是浮动，设置了 float 属性的元素会根据属性值向左或向右浮动，我们称设置了 float 属性的元素为浮动元素。

浮动元素会从普通文档流中脱离，但浮动元素影响的不仅是自己，它会影响周围的元素对齐进行环绕。

不管一个元素是行内元素还是块级元素，如果被设置了浮动，那浮动元素会生成一个块级框，可以设置它的width和height

1. 浮动元素在浮动的时候，其 margin 不会超过包含块的 padding（包含块：浮动元素的包含块就是离浮动元素最近的块级祖先元素。）
2. 如果有多个浮动元素，后面的浮动元素的 margin 不会超过前面浮动元素的 margin。简单说就是如果有多个浮动元素，浮动元素会按顺序排下来而不会发生重叠的现象。
3. 如果两个元素一个向左浮动，一个向右浮动，左浮动元素的 marginRight 不会和右浮动元素的 marginLeft 相邻。
4. 包含块的宽度大于两个浮动元素的宽度总和.
5. 包含块的宽度小于两个浮动元素的宽度总和。这时如果包含块宽度不够高，后面的浮动元素将会向下浮动，其顶端是前面浮动元素的底端。
6. 浮动元素顶端不会超过包含块的内边界底端，如果有多个浮动元素，下一个浮动元素的顶端不会超过上一个浮动元素的底端
7. 如果有非浮动元素和浮动元素同时存在，并且非浮动元素在前，则浮动元素不会不会高于非浮动元素
8. 在满足其他规则下，浮动元素会尽量向顶端对齐、向左或向右对齐

**清除浮动：**

1. clear 属性:在 clear 时要注意 clear 只对元素本身的布局起作用，仅作用于当前元素。
2. 增加额外的 div:在其父级元素的内容中增加一个（作为最后一个子元素）。
3. 父级元素添加 overflow:hidden
4. 将父元素设置 auto
5. 父元素设置 display:table
6. 设置 after 伪元素：子元素的后面，通过它可以设置一个具有 clear 的元素，然后将其隐藏。
