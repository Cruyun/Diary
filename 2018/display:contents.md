# How `display: contents` work?

正如我们经常提到的，[DOM 中的每个元素都是一个矩形框]([Controlling The Box Model](https://bitsofco.de/controlling-the-box-model/))。 从广义上讲，这个“矩形框”由两部分组成。 首先，我们有实际的框，包括 border、 padding、 margin area。 其次，我们有盒子的内容: content area 。

![](https://bitsofco.de/content/images/2018/03/Group-3.png)


## What is `display: contents` ?

根据 [W3C Spec](https://www.w3.org/TR/css-display-3/#box-generation):
> The element itself does not generate any boxes, but its children and pseudo-elements still generate [boxes](https://www.w3.org/TR/css-display-3/#css-box) and [text runs](https://www.w3.org/TR/css-display-3/#css-text-run) as normal. For the purposes of box generation and layout, the element must be treated as if it had been replaced in the [element tree]([CSS Display Module Level 3](https://www.w3.org/TR/css-display-3/#css-box)) by its contents (including both its source-document children and its pseudo-elements, such as ::before and ::after pseudo-elements, which are generated before/after the element’s children as normal).
> Note: As only the box tree is affected, any semantics based on the document tree, such as selector-matching, event handling, and property inheritance, are not affected.
> This value behaves as display: none on replaced elements and other elements whose rendering is not entirely controlled by CSS; see Appendix B: Effects of display: contents on Unusual Elements for details.

`display: contents` 元素本身不能生成任何盒模型，但是它的子元素或者伪元素可以正常生成。为了盒模型的生成与布局，该元素就好像在Dom树中被子元素与伪元素所替代一样。（For the purposes of box generation and layout, the element must be treated as if it had been replaced in the element tree by its contents）

举个例子🌰：

```
/* HTML */
<div class="outer">
  I’m some content
  <div class="inner">I’m some inner content</div>
</div>

/* CSS */
<div class="outer">
  I’m some content
  <div class="inner">I’m some inner content</div>
</div>
```

正常来说，我们认为效果是这样的

![](https://bitsofco.de/content/images/2018/03/Screen-Shot-2018-03-27-at-9.21.56-am.png)

但给outer 加上`display: contents`之后，效果是这样的 
![](https://bitsofco.de/content/images/2018/03/Screen-Shot-2018-03-27-at-9.23.20-am.png)

实际上，以上的效果和我们写这样的 HTML 代码是一样的

```
I’m some content
<div class="inner">I’m some inner content</div>
```

## What about the influence to other aspects?

`display: contents`的元素在应用其他属性时，可能会出现于普通元素不同的效果，但是，我们要记住一点：它的影响仅表现在视觉上，而不会改变HTML 。

## What about the element’s attributes?

因为元素被其内容替代，那它的属性是否会被应用上？实际上不会有影响。我们依然可以通过 ID  获得 DOM 节点。

```
<div id="label" style="display: contents;">Label here!</div>
<button aria-labelledby="label"><button>
```

但是若要利用元素得到 URL 不会生效。

```
<div id="target" style="display: contents;">Target Content</div>

<script>
  window.location.hash = "target";
  // => Nothing happens
</script>
```

## What about JS events?

对一个`display: none`的元素添加的事件不会被触发，但是由于`display: contents`依然可见，所以其事件可以被触发。

例如给一个元素添加一个点击事件的 listener，打印出	`this`值，我们依然可以得到绑定的 DOM 节点，因为它存在于 document 中。

```
<div class="outer">I’m some content</div>

<script>
  document.querySelector(".outer").addEventListener("click", function(event) {
    console.log(this);
    // => <div class="outer"></div>
  });
</script>
```

## What about pseudo-elements?

伪元素会被认为是元素的子元素之一，所以其显示是正常的，这一点在前文的 W3C 标准中也有提到。

```
<style>
  .outer { display: contents; }
  .outer::before { content: "Before" }
  .outer::after { content: "After" }
</style>

<div class="outer">I’m some content</div>
```

![](https://bitsofco.de/content/images/2018/03/Screen-Shot-2018-03-27-at-9.44.20-am.png)

## What about form elements, images and other replaced elements?

当使用可替换元素（replaced element）和一些表单元素（ from elements）时，它的行为会由于`display: contents` 有些变化。

### Replaced elements

对可替换元素应用 `display: contents`，试图移除元素的 box 并不会生效，因为他本身不是完整的盒子。对于这些元素来说，`display: contents` 相当于 `display: none`。

> CSS 里 可替换元素（replaced element）的展现不是由CSS来控制的。这些元素是一类 外观渲染独立于CSS的 外部对象。典型的可替换元素有  [img](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/img) 、  [object](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/object) 、  [video](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)  和 表单元素，如 [textarea](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/textarea) 、  [input](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input)  。 某些元素只在一些特殊情况下表现为可替换元素，例如 [audio](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio)  和  [canvas](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/canvas)  。 通过 CSS [content](https://developer.mozilla.org/zh-CN/docs/Web/CSS/content)  属性来插入的对象 被称作 *匿名可替换元素（*anonymous replaced elements*）*。
> CSS在某些情况下会对可替换元素做特殊处理，比如计算外边距和一些auto值。

### Form elements

对于许多表单元素，它们不是由单个“box”组成。 在浏览器中，它们由几个较小的元素组成。 与被替换的元素类似，移除元素的 box 没有意义。 因此，对于 `<select>`，`<input>` 和 `<textarea>` 等表单元素，`display：contents`功能与`display：none`完全相同。

## What about buttons and links?

`<button>` 和 `<a>` 标签不会有特殊的行为，实际上是`display: contents`的影响不明显。

## `display: contents`如何使用？

比如我们需要平行放置两张文章卡片

![](https://bitsofco.de/content/images/2018/03/Screen-Shot-2018-03-27-at-10.27.27-am.png)

我们有两张彼此相邻的“卡片”，每张卡都有一个标题，一个图表和一个页脚。我们想要的是每张卡内的每个部分都是相同的高度，无论每个部分的内容如何（例如，第一张卡只有1行，而第三张卡有3行标题，但第一张卡标题部分高度应与第三个匹配）。

我们可以使用CSS Grid实现这种布局，但我们需要每个“卡”中的所有元素都是彼此的直接兄弟。所以，我们可能需要像这样布局HTML

```
<div class="grid">
  <h2>This is a heading</h2>
  <p>...</p>
  <p>Footer stuff</p>
    
  <h2>This is a really really really super duper loooong heading</h2>
  <p>...</p>
  <p>Footer stuff</p>
</div>
```

我们可以应用下面的样式，这是 CSS Grids。

```
.grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 20px;
}
```

虽然这不是错误方法，但将`<article>`元素中的每个“卡”分组可能更有意义。这就是`display: contents`引进来的地方。我们可以在这里通过以语义上有意义的方式布置我们的标记。

```
<div class="grid">
  <article style="display: contents;">
    <h2>This is a heading</h2>
    <p>...</p>
    <p>Footer stuff</p>
  </article>
  <article style="display: contents;">
    <h2>This is a really really really super duper loooong heading</h2>
    <p>...</p>
    <p>Footer stuff</p>
  </article>
</div>
```

使用与上面相同的CSS，我们可以实现我们想要的布局。

目前，display: contents仅在两个主要浏览器中受支持，其他许多浏览器很快就会提供支持。
