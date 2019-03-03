# 使用 requestAnimationFrame 实现懒加载
## requestAnimationFrame()

requestAnimationFrame()用来在页面重绘前通知浏览器调用一个指定函数。在编写游戏中，一般会调用`timeInterval`或者`setTimeout`，如果需要绘制60fps 的动画，则刷妖每16.7毫秒（1000、60）绘制一帧，然而由于浏览器对于setTimeout的演示计算并不精确（原因在于：首先浏览器内置时钟的更新频率并不一致，其次setTimeout中的回调在延时后并不会立即执行，而是被加入执行队列中以此执行），因此产生掉帧现象。

使用`requestAnimationFrame`进行动画操作，该函数的参数是一个时间间隔，用于重绘每一帧的图像

> `window.requestAnimationFrame() ` 方法告诉浏览器你希望执行动画并请求浏览器在下一次重绘之前调用指定的函数来更新动画。该方法使用一个*回调函数*作为参数，这个回调函数会在浏览器重绘之前调用，回调的次数通常是每秒60次。(from MDN)

在某个单个帧中，有可能发生这种情况，在某一帧中会被多次触发某个事件（比如scroll），这个事件又会频繁的触发样式的修改，导致可能需要多次 layout 或者 paint，这其实是一种浪费，而且过于频繁的 layout 和paint 会造成卡顿，实际上在一帧中并不需要重复 layout 或者 paint 那么多次。使用`requestAnimationFrame()`，当 animation 运行时，在一个 timer loop（计时器循环）每几毫秒进行一次重绘。

调用这个函数的时候，我们告诉它需要做两件事： 1. 我们需要新的一帧；2.当你渲染新的一帧时需要执行我传给你的回调函数。

## 懒加载
requestAnimationFrame 的执行十几是页面重绘之前，我们知道浏览器中JS的执行是会阻塞页面渲染的，所以 requestAnimationFrame 的执行时机代表着当前 JS 线程的空闲。

### 防抖与节流
图片懒加载：
```
LazyLoad = {
	processScroll: funciotn () {
		for (var i = 0; I < LazyLoad.images.length; I++) {
			(LazyLoad.elementInViewport(LazyLoad.images[I])) {
                (function(i){
                    LazyLoad.loadImage(LazyLoad.images[I]);
                })(i)
		}
	}
}
```

在滚动时，判断懒加载的图片有没有出现在视口中，如果出现了，就加载图片。 scroll 时间就是一个高频率时间。当浏览器滚动的时候，一秒可以出发 scroll 时间数次，如果 scroll 时间绑定的时间内部处理非常复杂，很容易出现CPU占用率飙升，网页FPS突降的现象。

使用防抖 （Debouncing）处理：
```
LazyLoad = {
    // … 省略掉无关的代码 …
    timer: null,
    processScroll: function() {
        if(LazyLoad.timer){
            clearTimeout(LazyLoad.timer);
            LazyLoad.timer = null;
        }
        LazyLoad.timer = setTimeout(function(){
            for (var I = 0; I < LazyLoad.images.length; I++) {
                if (LazyLoad.elementInViewport(LazyLoad.images[I])) {
                    (function(i){
                        LazyLoad.loadImage(LazyLoad.images[I]);
                    })(i)
                }
            };
        },200);
    },
}

window.addEventListener(‘scroll’, LazyLoad.processScroll);
```

每次滚动后不是立即执行操作，而是使用 setTimeout 延时滚动200ms 执行；如果多次触发scroll 事件，后执行的操作会取消并充值计时器，也是就连续滚动时不会执行操作，而停止滚动候200ms 会执行操作。

这样就将多次的、连续的调用合并为一次，有效的防止了频繁触发事件带来的性能问题，但是缺点是：当用户一直滚动不放时，函数就一直不执行，用户就一直看不到照片。

于是需要节流（Throttling）：高频率调用函数时，不能执行太频繁，但也不能一直不执行，至少要每 x 毫秒执行一次。

```
LazyLoad = {
    // ... 省略掉无关的代码 ...
    timer: null,
    baseTimeStamp: null,
    processScroll: function() {
        var now = Date.now();
        if(!LazyLoad.baseTimeStamp) LazyLoad.baseTimeStamp = now;
        if(now - LazyLoad.baseTimeStamp > 200) {
            LazyLoad.loadImages();
            LazyLoad.baseTimeStamp = now;
            clearTimeout(LazyLoad.timer);
            LazyLoad.timer = null;
        }else {
            clearTimeout(LazyLoad.timer);
            LazyLoad.timer = null;
            LazyLoad.timer = setTimeout(LazyLoad.loadImages, 200);
        }
    },
    //抽出操作函数来复用..
    loadImages: function() {
        for (var i = 0; i < LazyLoad.images.length; i++) {
            if (LazyLoad.elementInViewport(LazyLoad.images[i])) {
                (function(i){
                    LazyLoad.loadImage(LazyLoad.images[i]);
                })(i)
            }
        };
    }
}

window.addEventListener('scroll', LazyLoad.processScroll);
```

### 使用 requestAnimationFrame实现懒加载
使用 requestAnimationFrame 来做节流，让浏览器自动在空闲时执行操作，可以在性能优化的前提下，尽量多执行操作，增强用户体验。

requestAnimationFrame 只会将操作延迟到下次重绘前执行，并不会主动做节流；可以引入一个锁变量表示当前能否响应操作，如果可以，执行 requestAnimationFrame的回调函数并上锁，不再响应新请求；在执行完回调函数后解锁，这样就可以保证在一帧内只注册一次函数。

### requestAnimationFrame在layzr.js中的使用


```
function requestScroll () {
    prevLoc = getLoc()
    requestFrame()
  }
function requestFrame () {
		// ticking相当于上文的锁变量
    if (!ticking) {
      window.requestAnimationFrame(() => check())
      ticking = true
    }
  }
 // 检查元素位置是否改变并且进行请求，执行后改变锁变量
function check () {
    windowHeight = window.innerHeight
		// inViewport用于判断节点是否出现，setSource改变节点属性
    nodes.forEach(node => inViewport(node) && setSource(node))
    ticking = false
    return this
  }
```

参考及相关阅读：
- [使用 requestAnimationFrame 实现性能优化与懒执行](https://www.404forest.com/2016/08/15/%E4%BD%BF%E7%94%A8%20requestAnimationFrame%20%E5%AE%9E%E7%8E%B0%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96%E4%B8%8E%E6%87%92%E6%89%A7%E8%A1%8C/)
- [使用requestanimationframe进行性能优化](https://medium.com/@yundong/%E4%BD%BF%E7%94%A8requestanimationframe%E8%BF%9B%E8%A1%8C%E6%80%A7%E8%83%BD%E4%BC%98%E5%8C%96-6a8d2c79ced3)
- [layzr.js/layzr.js at master · callmecavs/layzr.js · GitHub](https://github.com/callmecavs/layzr.js/blob/master/src/layzr.js)