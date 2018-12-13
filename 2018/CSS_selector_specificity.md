# CSS selector specificity
### 优先级

优先级就是分配给指定的CSS声明的一个权重，它由 匹配的选择器中的 每一种选择器类型的 *数值* 决定。

而当优先级与多个CSS声明中任意一个声明的优先级相等的时候，CSS中*最后*的那个声明将会被应用到元素上。

当同一个元素有多个声明的时候，优先级才会有意义。因为每一个直接作用于元素的CSS规则总是会接管/覆盖（take over）该元素从祖先元素继承而来的规则。

下面列表中，选择器类型的优先级是递增的：

1. 类型选择器（type selectors）（例如, `h1`）和 伪元素（pseudo-elements）（例如, `::before`）
2. 类选择器（class selectors） (例如,`.example`)，属性选择器（attributes selectors）（例如,` [type="radio"]`），伪类（pseudo-classes）（例如, :hover）
3. ID选择器（例如, `#example`）

- 给元素添加的内联样式 (例如, style="font-weight:bold") 总会覆盖外部样式表的任何样式 ，因此可看作是具有最高的优先级。.

- 当在一个样式声明中使用一个!important 规则时，此声明将覆盖任何其他声明，甚至是內联样式。虽然技术上!important与优先级无关，但它与它直接相关。

> 通配选择符（universal selector）(*), 关系选择符（combinators） (+, >, ~, ' ')  和 否定伪类（negation pseudo-class）(:not()) 对优先级没有影响。（但是，在 :not() 内部声明的选择器是会影响优先级）。


## 计算selector specificity

![](https://wx2.sinaimg.cn/mw690/9f2b0190gy1fy587fqh7cj20fu09maas.jpg)

- 如果元素具有内联样式，则自动成为最高级（1,0,0,0分）
- 对于每个 id，加0,1,0,0分
- 对于每个类值（或伪类、属性选择器），加0,0,1,0分
- 对于每个element ，加0,0,0,1分

可以把以上分值看成一个数字，如1,0,0,0是“1000”，因此显然胜过0,1,0,0或“100”的specificity。

🌰：

![](https://wx2.sinaimg.cn/mw690/9f2b0190gy1fy58irumyuj20fu09mq3n.jpg)

![](https://wx4.sinaimg.cn/mw690/9f2b0190gy1fy58j56hqzj20fu09mdgk.jpg)

参考及推荐阅读：

- [Specificity | MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [Understanding CSS: Selector Specificity](https://medium.com/@dte/understanding-css-selector-specificity-a02238a02a59)
- [Specifics on CSS Specificity](https://css-tricks.com/specifics-on-css-specificity/)
- [CSS Specificity And Inheritance — Smashing Magazine](https://www.smashingmagazine.com/2010/04/css-specificity-and-inheritance/)