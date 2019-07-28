# react-router
#框架
React-router原理？用到哪些API？
[react-router的实现原理](http://zhenhua-lee.github.io/react/history.html)
### 1. react-router的依赖基础 - history

*1.1 History的整体介绍*
 [history](https://github.com/reactjs/history/blob/master/docs/Glossary.md?name=232#sssss) 是一个独立的第三方js库，可以用来兼容在不同浏览器、不同环境下对历史记录的管理，拥有统一的API。具体来说里面的history分为三类:
* 老浏览器的history: 主要通过hash来实现，对应createHashHistory
* 高版本浏览器: 通过html5里面的history，对应createBrowserHistory
* node环境下: 主要存储在memeory里面，对应createMemoryHistory

 三个API的大致的技术实现如下:
* createBrowserHistory### : 利用HTML5里面的history
* * createHashHistory### : 通过hash来存储在不同状态下的history信息
* * createMemoryHistory### : 在内存中进行历史记录的存储

- 1.2.1 执行URL前进
* * createBrowserHistory### : pushState、replaceState*
* createHashHistory### :location.hash=***location.replace()
* createMemoryHistory### : 在内存中进行历史记录的存储

### react-router的基本原理一句话：实现URL与UI界面的同步。其中在react-router中，URL对应Location对象，而UI是由reactcomponents来决定的，这样就转变成location与components之间的同步问题。

![](https://github.com/Cruyun/Diary/blob/master/img/router.png?raw=true)