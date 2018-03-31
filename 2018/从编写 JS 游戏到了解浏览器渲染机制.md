# 从编写 JS 游戏到了解浏览器渲染机制

学习了 eloquent JavaScript 中的 platform game，我们对编写 JS 游戏有了大致步骤的了解，本文主要解析 JS 编写游戏的主要步骤，以及游戏的绘制机制。参考代码为	[Eloquent JavaScript 3rd edition Chapter16](http://eloquentjavascript.net/16_game.html#c_ObYKMNTKci)。

## 1.组织游戏的对象和方法

### 1）定义游戏中的实体

在编写游戏前，先理清楚游戏的过程和元素实体，于是首先我们要为每个类型的元素创建对象，为其添加相应的属性、状态、方法。

从整体出发，先定义游戏中固定的对象，例如关卡、场景等。使用数组和字符串来描述一张二维网格定义游戏关卡，二维数组中用不同的字符定义元素。例如下面类 Level的储存了地图的宽度、高度、两个数组（表示网格和活动元素）


```
class Level {
  constructor(plan) {
    let rows = plan.trim().split("\n").map(l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type == "string") return type;
        this.startActors.push(
          type.create(new Vec(x, y), ch));
        return "empty";
      });
    });
  }
}
```
我们不仅需要定义游戏元素的各个对象的构造函数，而且需要定义 Vec 等辅助游戏元素活动的对象，游戏中的元素位置保存在 Vec 对象中，这是一个二维向量，包含 x、y 属性和计算位置的方法，。

```
class Vec {
  constructor(x, y) {
    this.x = x; this.y = y;
  }
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}
```

### 2）定义游戏的全局状态

当游戏运行时，玩家会在任意位置失败或成功而结束游戏或进入下一个场景，我们定义一个状态类以跟踪游戏的运行状态。

```
class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find(a => a.type == "player");
  }
}
```

---

## 2.游戏的绘制机制


处理活动元素的动作和冲突后往往需要更新游戏全局的状态，分发到每一个实体上。每当状态改变，触发render方法，render方法根据最新的 state 更新UI，改变 view，view 的实现可以选择操作 DOM 等方法，最后在每一帧调用更新方法(requstAnimationFrame)。


### 1）更新游戏全局的状态
update 方法传递了时间间隔和按键信息作为参数。它所做的第一件事情就是在所有的 actors 上面调用 update 方法，生成一个更新的 actors 的数组，也同样地接受时间间隔、按键信息和状态等参数，以便他们根据这些变化进行更新。

```
State.prototype.update = function(time, keys) {
  let actors = this.actors
    .map(actor => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);

  if (newState.status != "playing") return newState;

  let player = newState.player;
  if (this.level.touches(player.pos, player.size, "lava")) {
    return new State(this.level, actors, "lost");
  }

  for (let actor of actors) {
    if (actor != player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
};
```

### 2）渲染视图

```
 DOMDisplay.prototype.setState = function(state) {
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};
```
setState 方法用于让视图显示一个特性的状态，它首先移除旧的元素图像，然后重绘他们在新位置上的图像。如果要渲染新的 DOM，只需要改变 classname，因为在 DOMDisplay的构造函数里，调用了 `function elt(name, attrs, ...children)`方法给创建新的元素并且添加属性和子节点。

```
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", {class: "game"}, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() { this.dom.remove(); }
}
```

### 3）调用更新方法定时重绘：requestAnimationFrames

游戏场景定时重绘，不是用timeinterval或者setTimeout，而是第十三章的requestAnimationFrames函数，该函数要求我们跟踪上次调用函数的事件，并在每一帧后再次调用requestAnimationFrame方法。在这里定义一个辅助函数把代码包装到runAnimation的简单接口里，用于组织 requestAnimationFrame() 的执行。

```
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
```
该函数的参数是一个时间间隔，用于重绘每一帧的图像，当帧函数返回false的时候，整个动画停止。

+ 参数frameFunc，是真正的游戏场景刷新函数；
+ 内部的fame函数有个time参数，它是由系统传入的，是当前系统时间；
+ timeStep 是当前时间与上次刷新时间的间隔，问什么要给它取个最大值(100ms)呢？ 因为，如果浏览器窗口 (或tab) 被隐藏了，系统就会停止刷新该窗口，直到该窗口重新显示出来。 这可以起到暂停游戏的作用。

> window.requestAnimationFrame() 方法告诉浏览器你希望执行动画并请求浏览器在下一次重绘之前调用指定的函数来更新动画。该方法使用一个回调函数作为参数，这个回调函数会在浏览器重绘之前调用，回调的次数常是每秒60次。(from MDN)


在某个单个帧中，有可能发生这种情况，在某一帧中会被多次触发某个事件（比如scroll），这个事件又会频繁的触发样式的修改，导致可能需要多次 layout 或者 paint，这其实是一种浪费，而且过于频繁的 layout 和paint 会造成卡顿，实际上在一帧中并不需要重复 layout 或者 paint 那么多次。使用`requestAnimationFrame()`，当animation 运行时，在一个 timer loop（计时器循环）每几毫秒进行一次重绘。

浏览器可以将并发动画优化为单个回流和重绘周期，从而实现更高保真度的动画。 例如，基于JS的动画与CSS转换或SVG SMIL同步。 另外，在不可见的选项卡中运行动画循环，浏览器将无法继续运行，也就是上面 timeStep 的作用，这意味着可以减少CPU，GPU和内存使用量。

### 数据驱动
活动元素发生碰撞冲突时，需要去改变元素的位置等让视图更新，在这过程中，很重要一个理念是**数据与视图是分离的**。**数据驱动运作视图**，避免直接操作 DOM ，即数据是输入，视图是输出，视图是基于数据的渲染结果。

runLevel函数接受一个Level对象和一个display构造函数，并返回一个promise。 它将关卡显示在页面上，让用户进行游戏。 当关卡完成（失败或获胜）时，runLevel会再等待一秒（让用户看到会发生什么），然后清除显示，停止动画并解析游戏结束状态的promise。

```
function runLevel(level, Display) {
    let display = new Display(document.body, level);
    let state = State.start(level);
    let ending = 1;
    return new Promise(resolve => {
      runAnimation(time => {
        state = state.update(time, arrowKeys);
        display.setState(state);
        if (state.status == "playing") {
          return true;
        } else if (ending > 0) {
          ending -= time;
          return true;
        } else {
          display.clear();
          resolve(state.status);
          return false;
        }
      });
    });
}
```
---

# 3.浏览器的渲染机制

### 单个帧的渲染流程
目前，大多数设备的刷新率都是60FPS，如果浏览器在交互的过程中能够时刻保持在60FPS左右，用户就不会感到卡顿，否则，就会影响用户的体验。

下图为浏览器运行的单个帧的渲染流程，称为像素管道，假如其中的一个或多个环节执行时间过长会导致卡顿。

从纯粹的数学角度而言，每帧的预算约为**16 毫秒**（1000 毫秒 / 60 帧 = 16.66 毫秒/帧）。**每16ms，浏览器都会先运行 JS，再渲染 UI，把最新的 state 映射到 UI。**
![pineline.jpg](https://upload-images.jianshu.io/upload_images/4938344-fd0b6b1411a290ef.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

### 浏览器的线程

通常一个浏览器会至少存在三个线程：JS引擎线程（用于处理JS）、GUI渲染线程（用于页面渲染）、浏览器时间触发线程（用于控制交互）。

> 由于JavaScript是可操纵DOM的，如果在修改这些元素属性同时渲染界面（即JavaScript线程和UI线程同时运行），那么渲染线程前后获得的元素数据就可能不一致了。因此为了防止渲染出现不可预期的结果，浏览器设置GUI渲染线程与JavaScript引擎为互斥的关系，当JavaScript引擎执行时GUI线程会被挂起，GUI更新会被保存在一个队列中等到引擎线程空闲时立即被执行。

JS引擎是基于事件驱动，采用的是单线程运行机制。即JS引擎会只会顺序的从任务列表中取任务，并执行。


### 浏览器渲染流程

通过网络模块加载到HTML文件后渲染引擎渲染流程如下，这也通常被称作关键渲染路径（Critical Rendering Path）：

1. 构建DOM树(DOM tree)：从上到下解析HTML文档生成DOM节点树（DOM tree），也叫内容树（content tree）；
2. 构建CSSOM(CSS Object Model)树：加载解析样式生成CSSOM树；
3. 执行JavaScript：加载并执行JavaScript代码（包括内联代码或外联JavaScript文件）；
4. 构建渲染树(render tree)：根据DOM树和CSSOM树,生成渲染树(render tree)；
 - 渲染树：按顺序展示在屏幕上的一系列矩形，这些矩形带有字体，颜色和尺寸等视觉属性。

5. 布局（layout）：根据渲染树将节点树的每一个节点布局在屏幕上的正确位置；

6. 绘制（painting）：遍历渲染树绘制所有节点，为每一个节点适用对应的样式，这一过程是通过UI后端模块完成；（UI后端：指浏览器的的图形库等）

![critical-rendering-path.png](https://upload-images.jianshu.io/upload_images/4938344-a7ef460875451b47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


---

**小结：**
A Platform Game的大致思路是先定义游戏中的各个实体，包括相应的属性、状态、更新状态的方法，定义全局的游戏状态和更新全局状态（update state）的方法，以数据驱动渲染视图（render view），最后在每一帧（requestAnimationFrame）调用更新方法定时重绘。

浏览器的渲染同理，每16ms渲染一次， 将最新的 state 映射到 UI。

另外值得注意的是，捕获与冒泡和事件代理能大大优化处理事件的思路。

 参考及相关阅读：
 
 - [Eloquent JavaScript 3rd：A Platform Game](http://eloquentjavascript.net/16_game.html#c_ObYKMNTKci)
 - [浏览器进程和线程](http://imweb.io/topic/58e3bfa845e5c13468f567d5)
 - [Rendering Performance](https://developers.google.com/web/fundamentals/performance/rendering/)