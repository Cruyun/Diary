# Vue 2.x 的 virtual-dom 实现与diff算法

整合三篇文章，一个较详细的总结:

- [Vue 2.0 的 virtual-dom 实现简析 ](https://github.com/DDFE/DDFE-blog/issues/18)
- [解析vue2.0的diff算法](https://github.com/aooy/blog/issues/2)
- [深入 Vue2.x 的虚拟 DOM diff 原理](https://cloud.tencent.com/developer/article/1006029)

---
## 前言
Virtual DOM 作为 Vue 的核心之一，因为是纯粹的 JS 对象，所以操作会很高效，将 VDOM 的变更转换成真实的 DOM，从而实现高效的 DOM 操作得力于 diff 算法，Vue 的 diff 算法是基于[snabbDOM](https://github.com/snabbDOM/snabbDOM/blob/v0.7.1/src/snabbDOM.ts#L179)，复杂度为O(N)。

---

## Virtual DOM
关于 Virtual DOM，我们在前面的分享中已经讨论学习过。我们知道 VDOM 是虚拟 DOM 节点，对应真实 DOM。用一个简单的JS 对象代表真实DOM，它存储了对应 DOM 的一些重要参数，在改变 DOM 之前，会先比较相应虚拟DOM 的数据，如果需要改变，才会将改变应用到真实 DOM 上。

**为什么不直接操作DOM 而需要加一层 Virtual DOM呢？**

很多时候手工优化 DOM 确实会比 virtual DOM 效率高，对于比较简单的 DOM 结构用手工优化没有问题，但当页面结构很庞大，结构很复杂时，手工优化会花去大量时间，而且可维护性也不高，不能保证每个人都有手工优化的能力。至此，Virtual DOM的解决方案应运而生，Virtual DOM很多时候都不是最优的操作，但它具有普适性，在效率、可维护性之间达平衡。

 --- 

## diff 算法

### 同层级比较
其实Vue 2.x的 diff 算法和 react 相似，这是来自一篇相当经典的文章[React’s diff algorithm](https://calendar.perfplanet.com/2013/diff/)中的图，可以看出**DOM 的比较只会在同层级进行，不会跨层级比较**
![diddvdom.png](https://upload-images.jianshu.io/upload_images/4938344-b92d374212bda0f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### Patch

通过 Vue template模板编译 我们得出，模板编译的结果是`render function`。`render function`在`vm._render`完成的运行结果是 VNode。
初始化时，通过`render function` 生成 VNode的同时进行`Watcher`的绑定。当数据发生会变化时，会执行`_update`方法，生成一个新的VNode对象，然后调用`__patch__`方法，比较新生成的VNode和旧的VNode，最后将差异（变化的节点）更新到真实的DOM树上。

所以 diff 的核心在于 [patch](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js#L441)。diff的过程就是调用patch函数，就像打补丁一样修改真实dom。

```
function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
        // 当oldVnode不存在时
        if (isUndef(oldVnode)) {
            // 创建新的节点
            createElm(vnode, insertedVnodeQueue, parentElm, refElm)
        } else {
            const isRealElement = isDef(oldVnode.nodeType)
            if (!isRealElement && sameVnode(oldVnode, vnode)) {
            // patch existing root node
            // 对oldVnode和vnode进行diff，并对oldVnode打patch
            patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } 
        }
    }
```
patch方法接收6个参数：

- oldVnode: 旧的VNode或旧的真实DOM节点
- vnode: 新的VNode
- hydrating: 是否要和真实DOM混合
- removeOnly: 特殊的flag，用于<transition-group>
- parentElm: 父节点
- refElm: 新节点将插入到refElm之前

在对oldVnode和vnode类型判断中有个sameVnode方法，这个方法决定了是否需要对oldVnode和vnode进行diff及patch的过程。

```
function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  )
}
```

sameVnode 会对传入的2个 VNode 进行基本属性的比较，只有当基本属性相同的情况下才认为这个2个 VNode 只是局部发生了更新，然后才会对这2个 VNode 进行diff，如果2个 vnode 的基本属性存在不一致的情况，那么就会直接跳过diff的过程，进而依据VNode新建一个真实的dom，同时删除老的dom节点。

回到patch函数当中，在当oldVnode不存在的时候，这个时候是root节点初始化的过程，因此调用了createElm(vnode, insertedVnodeQueue, parentElm, refElm)方法去创建一个新的节点。而当oldVnode是vnode且sameVnode(oldVnode, vnode)2个节点的基本属性相同，那么就进入了2个节点的diff过程。

diff的过程主要是通过调用patchVnode(src/core/vdom/patch.js)方法进行,

```
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  if (oldVnode === vnode) {
    return
  }
	const elm = vnode.elm = oldVnode.elm
    const oldCh = oldVnode.children
    const ch = vnode.children
    ...
    
    // 如果vnode没有文本节点
    if (isUndef(vnode.text)) {
      // 如果oldVnode的children属性存在且vnode的属性也存在
      if (isDef(oldCh) && isDef(ch)) {
        // updateChildren，对子节点进行diff
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) {
        // 如果oldVnode的text存在，那么首先清空text的内容
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // 然后将vnode的children添加进去
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 删除elm下的oldchildren
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // oldVnode有子节点，而vnode没有，那么就清空这个节点
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 如果oldVnode和vnode文本属性不同，那么直接更新真是dom节点的文本元素
      nodeOps.setTextContent(elm, vnode.text)
    }
```
diff 过程中分几类情况，`oldCh`为`oldVnode`的子节点，`ch`为`Vnode`的子节点：

1. 首先判断文本节点，若 text 相同则直接替换文本节点；
2. 若 vnode 没有文本节点，进入子节点的 diff；
3. 当 oldCh 和 ch 存在且不相同时，调用`updateChildren`对子节点进行 diff；
4. 若oldCh不存在，ch存在，首先清空oldVnode的文本节点，同时调用addVnodes方法将ch添加到elm真实dom节点当中；
5. 若oldCh存在，ch不存在，则删除elm真实节点下的oldCh子节点；
6. 若oldVnode有文本节点，而vnode没有，那么就清空这个文本节点。

### diff 的核心：updateChildren

**分两个部分：**

![diffall.png](https://upload-images.jianshu.io/upload_images/4938344-10751b981f430951.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
[图片来源](https://cloud.tencent.com/developer/article/1006029)

1. 循环：循环内部是一个分支逻辑，每次循环只会进入其中的一个分支，每次循环会处理一个节点，处理之后将节点标记为已处理（oldVdom和newVdom都要进行标记，如果节点只出现在其中某一个vdom中，则另一个vdom中不需要进行标记），标记的方法有2种，当节点正好在vdom的指针处，移动指针将它排除到未处理列表之外即可，否则就要采用其他方法，Vue的做法是将节点设置为undefined。

2. 循环结束之后，可能newVdom或者oldVdom中还有未处理的节点，如果是newVdom中有未处理节点，则这些节点是新增节点，做新增处理。如果是oldVdom中有这类节点，则这些是需要删除的节点，相应在DOM树中删除。

整个过程是逐步找到更新前后vdom的差异，然后将差异反映到DOM树上（也就是patch），特别要提一下Vue的patch是即时的，并不是打包所有修改最后一起操作DOM（React则是将更新放入队列后集中处理），实际上现代浏览器对这样的DOM操作做了优化，并无差别。

**源码分析**

```
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    // 为oldCh和newCh分别建立索引，为之后遍历的依据
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx, idxInOld, elmToMove, refElm
    
    // 直到oldCh或者newCh被遍历完后跳出循环
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 插入到老的开始节点的前面
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 如果以上条件都不满足，那么这个时候开始比较key值，首先建立key和index索引的对应关系
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
        // 如果idxInOld不存在
        // 1. newStartVnode上存在这个key,但是oldKeyToIdx中不存在
        // 2. newStartVnode上并没有设置key属性
        if (isUndef(idxInOld)) { // New element
          // 创建新的dom节点
          // 插入到oldStartVnode.elm前面
          // 参见createElm方法
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          
          // 将找到的key一致的oldVnode再和newStartVnode进行diff
          if (sameVnode(elmToMove, newStartVnode)) {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            // 移动node节点
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          } else {
            // same key but different element. treat as new element
            // 创建新的dom节点
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          }
        }
      }
    }
    // 如果最后遍历的oldStartIdx大于oldEndIdx的话
    if (oldStartIdx > oldEndIdx) {        // 如果是老的vdom先被遍历完
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      // 添加newVnode中剩余的节点到parentElm中
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) { // 如果是新的vdom先被遍历完，则删除oldVnode里面所有的节点
      // 删除剩余的节点
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
}
```
![diff2.png](https://upload-images.jianshu.io/upload_images/4938344-3959db11d8e5201e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
过程可以概括为：oldCh和newCh各有两个头尾的变量StartIdx和EndIdx，它们的2个变量相互比较，一共有4种比较方式。如果4种比较都没匹配，如果设置了key，就会用key进行比较，在比较的过程中，变量会往中间靠，一旦StartIdx>EndIdx表明oldCh和newCh至少有一个已经遍历完了，就会结束比较。

### 具体的diff分析

**设置key和不设置key的区别：**

不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。

diff的遍历过程中，只要是对dom进行的操作都调用api.insertBefore，api.insertBefore只是原生insertBefore的简单封装。
比较分为两种，一种是有vnode.key的，一种是没有的。但这两种比较对真实dom的操作是一致的。

对于与sameVnode(oldStartVnode, newStartVnode)和sameVnode(oldEndVnode,newEndVnode)为true的情况，不需要对dom进行移动。

**三种 DOM 操作：**

1. 当oldStartVnode，newEndVnode值得比较，说明oldStartVnode.el跑到oldEndVnode.el的后边了。
图中假设startIdx遍历到1。
![dom1.png](https://upload-images.jianshu.io/upload_images/4938344-264e75ab3271cf5a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 当oldEndVnode，newStartVnode值得比较，说明 oldEndVnode.el跑到了oldStartVnode.el的前边。
![dom2.png](https://upload-images.jianshu.io/upload_images/4938344-39cf3c9c6e52f541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. newCh中的节点oldCh里没有， 将新节点插入到oldStartVnode.el的前边。
![dom3.png](https://upload-images.jianshu.io/upload_images/4938344-b30b4d89cfa0f1c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**diff实例（不带 key)：**

最上面一行 DOM 为真实 DOM，第二行为 oldCh，第三行为 newCh。

![](https://upload-images.jianshu.io/upload_images/4938344-0a5e5d95a2775c01.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1. 处理头部的同类型节点，即oldStart和newStart指向同类节点的情况，说明值得比较，如下图中的节点1

这种情况下，将节点1的变更更新到DOM，然后对其进行标记，标记方法是oldStart和newStart后移1位即可，过程中不需要移动DOM（更新DOM或许是要的，比如属性变更了，文本内容变更了等等）


![](https://upload-images.jianshu.io/upload_images/4938344-fed4a5dc9f2e1e83.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 处理尾部的同类型节点，即oldEnd和newEnd指向同类节点的情况，如下图中的节点10

与上一步类似，将节点10的变更更新到DOM，然后oldEnd和newEnd前移1位进行标记，同样也不需要移动DOM

![diff-step-3.png](https://upload-images.jianshu.io/upload_images/4938344-cfa0623b3dffa921.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. oldStartIdx 和 newEndIdx 指向同一类型节点，那么把2节点移到9节点后面，移动之后标记该节点，将oldStart后移1位，newEnd前移一位。

![](https://upload-images.jianshu.io/upload_images/4938344-68d15ad418b6935d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. oldEndIdx 和 newStartIdx 指向同一类型节点，那么把9节点移到3节点后面，移动之后标记该节点，将oldStart后移1位，newEnd前移一位。

![](https://upload-images.jianshu.io/upload_images/4938344-107155a37c2dffd9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5. 新旧的 DOM 的头尾节点各不相同，说明11是新增的节点，就创建一个新的节点，插到oldStart指向的节点（即节点3）前面，然后将newStart后移1位标记为已处理（注意oldVdom中没有节点11，所以标记过程中它的指针不需要移动），处理之后如下图

![](https://upload-images.jianshu.io/upload_images/4938344-7dbd40aeceecbb97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

newStart来到了节点7的位置，在oldVdom中能找到它而且不在指针位置（查找oldVdom中oldStart到oldEnd区间内的节点），说明它的位置移动了

那么需要在DOM树中移动它，移到oldStart指向的节点（即节点3）前面，与此同时将节点标记为已处理，跟前面几种情况有点不同，newVdom中该节点在指针下，可以移动newStart进行标记，而在oldVdom中该节点不在指针处，所以采用设置为undefined的方式来标记

![](https://upload-images.jianshu.io/upload_images/4938344-5e383d5caf53c890.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

处理之后如图
![](https://upload-images.jianshu.io/upload_images/4938344-0a32d20d7da835de.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

6. newStart和oldStart又指向了同一个节点（即都指向节点3），很简单，按照第一步中的做法只需移动指针即可，非常高效，3、4、5、6都如此处理，处理完之后如下图

![](https://upload-images.jianshu.io/upload_images/4938344-474f91e991a6305d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

经过以上处理之后（实际上是循环进行的），newStart跨过了newEnd，它们相遇啦！而这个时候，oldStart和oldEnd还没有相遇，说明这2个指针之间的节点（包括它们指向的节点，即上图中的节点7、节点8）是此次更新中被删掉的节点。

那我们在DOM树中将它们删除，再回到前面我们对节点7做了标记，为什么标记是必需的？标记的目的是告诉Vue它已经处理过了，是需要出现在新DOM中的节点，不要删除它，所以在这里只需删除节点8。

在应用中也可能会遇到oldVdom的起止点相遇了，但是newVdom的起止点没有相遇的情况，这个时候需要对newVdom中的未处理节点进行处理，这类节点属于更新中被加入的节点，需要将他们插入到DOM树中。

![](https://upload-images.jianshu.io/upload_images/4938344-eeb7ad2c02fe6ad2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**带有 key 的 DOM diff 例子：**可以参考[这篇文章末尾的图](https://github.com/aooy/blog/issues/2)