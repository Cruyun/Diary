# Google 性能系列文章笔记

## 性能优化 Overview
1. 资源
- UI库的选择是否必要，Flexbox 和 Grid 代码精简但是布局更复杂。CSS 是渲染阻塞的资源，所以应去掉过多不必要的CSS 资源
- JS库的选择。JQuery 等库大量的使用` querySelector` `querySelectorAll `等API 。如果选择库，尽量选择轻量的，比如Preact 替代 react
- 不是所有网站都适合SPA架构，例如新闻和博客网站作为传统多页应用也可以有好的性能
2.  发送资源的方式
- HTTP/2：相比 HTTP/1.1，有许多性能优化，比如concurrent request limits and the lack of header compression.
> HTTP/2’s primary changes from HTTP/1.1 focus on improved performance. Some key features such as multiplexing, header compression, prioritization and protocol negotiation evolved from work done in an earlier open, but non-standard protocol named SPDY.
* 与HTTP/1.1在 [请求方法](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#.E8.AF.B7.E6.B1.82.E6.96.B9.E6.B3.95) 、 [状态码](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#%E7%8A%B6%E6%80%81%E7%A0%81) 乃至 [URI](https://zh.wikipedia.org/wiki/URI) 和绝大多数 [HTTP头部](https://zh.wikipedia.org/w/index.php?title=HTTP%E5%A4%B4%E9%83%A8&action=edit&redlink=1) 字段等方面保持高度兼容性。
* 通过以下举措，减少 [网络延迟](https://zh.wikipedia.org/wiki/%E5%BB%B6%E8%BF%9F_(%E5%B7%A5%E7%A8%8B%E5%AD%A6)) ，提高浏览器的页面加载速度：
	* 对 [HTTP头字段](https://zh.wikipedia.org/wiki/HTTP%E5%A4%B4%E5%AD%97%E6%AE%B5) 进行 [数据压缩](https://zh.wikipedia.org/wiki/%E6%95%B0%E6%8D%AE%E5%8E%8B%E7%BC%A9) (即HPACK算法)；
	* HTTP/2 服务端推送(Server Push)；
	* 请求 [管线化](https://zh.wikipedia.org/wiki/HTTP%E7%AE%A1%E7%B7%9A%E5%8C%96) ；
	* 修复HTTP/1.0版本以来未修复的 [队头阻塞](https://zh.wikipedia.org/wiki/%E9%98%9F%E5%A4%B4%E9%98%BB%E5%A1%9E) 问题；
	* 对数据传输采用 [多路复用](https://zh.wikipedia.org/wiki/%E5%A4%9A%E8%B7%AF%E5%A4%8D%E7%94%A8) ，让多个请求合并在同一 [TCP](https://zh.wikipedia.org/wiki/TCP) 连接内。
* 支持现有的HTTP应用场景，包括桌面和移动设备浏览器，网络API，不同规格的 [网络服务器](https://zh.wikipedia.org/wiki/%E7%BD%91%E7%BB%9C%E6%9C%8D%E5%8A%A1%E5%99%A8) 和 [正向代理](https://zh.wikipedia.org/w/index.php?title=%E6%AD%A3%E5%90%91%E4%BB%A3%E7%90%86&action=edit&redlink=1) 、 [反向代理](https://zh.wikipedia.org/wiki/%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86) 服务器软件， [防火墙](https://zh.wikipedia.org/wiki/%E9%98%B2%E7%81%AB%E5%A2%99) ，CDN等。

HTTP/2 保留了 HTTP/1.1 的大部分语义，例如 [请求方法](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#%E8%AF%B7%E6%B1%82%E6%96%B9%E6%B3%95) 、 [状态码](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#%E7%8A%B6%E6%80%81%E7%A0%81) 乃至 [URI](https://zh.wikipedia.org/wiki/URI) 和绝大多数 [HTTP头部](https://zh.wikipedia.org/w/index.php?title=HTTP%E5%A4%B4%E9%83%A8&action=edit&redlink=1) 字段一致。而 HTTP/2 采用了新的方法来编码、传输客户端——服务器间的数据。

[HTTP/2 — Wikipedia](https://zh.wikipedia.org/wiki/HTTP/2)
- 提前加载重要资源 
* *preload* ：如果我们确定某个资源将来一定会被使用到，我们可以让浏览器预先请求该资源并放入浏览器缓存中。例如，一个图片和脚本或任何可以被浏览器缓存的资源。`rel=preload` 是声明式的 fetch，可以强制浏览器请求资源，同时不阻塞文档 onload 事件。例如字体、顶部图片和主要的 webpack 打包文件使用，在首屏绘制和可交互延迟上减少时间。
* *DNS-Prefetch* DNS 预解析 ，通过 DNS 预解析来告诉浏览器未来我们可能从某个特定的 URL 获取资源，当浏览器真正使用到该域中的某个资源时就可以尽快地完成 DNS 解析。当我们从该 URL 请求一个资源时，就不再需要等待 DNS 的解析过程。该技术对使用第三方资源特别有用。
*Prefetch 提示浏览器这个资源将来可能需要*，但是把决定是否和什么时间加载这个资源的决定权交给浏览器。
*对于当前页面很有必要的资源使用 preload，对于可能在将来的页面中使用的资源使用 prefetch。*
[深入研究Chrome：Preload与Prefetch原理，及其优先级_前端之巅_传送门](https://chuansongme.com/n/1762216352335)

* *preconnect*：与 DNS 预解析类似，preconnect不仅完成 DNS 预解析，同时还将进行 TCP 握手和建立传输层协议。可以这样使用：

- 使用 webpack 的 code spliting

3. 发送数据的大小
- 减少文本体积：去除不必要的空格、注释等，uglify JS、SVGO优化SVG（SVG Optimizer is a Nodejs-based tool for optimizing SVG vector graphics files.[image:448E8CE9-2CF1-4A44-BB25-F8DC5294BB7B-329-000034E2ADE2375D/68747470733a2f2f6d632e79616e6465782e72752f77617463682f3138343331333236.gif]）
- 压缩资源：Gzip
- 压缩图片
- 用 WebP、JPEG XR取代JPEG PNG
- 自适应加载图片，选择适合的图片
- 用 vedio 取代动画 GIF
- 客户端提示可以根据当前网络条件和设备特征定制资源交付。 DPR，Width和Viewport-Width标头可以帮助使用服务器端代码为设备提供最佳图像，并提供更少的标记。 Save-Data 头部可以帮助为明确要求用户提供更轻松的应用程序体验。
- [NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation) API
