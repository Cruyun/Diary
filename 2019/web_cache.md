# HTTP WEB缓存

[浅谈Web缓存 | AlloyTeam](http://www.alloyteam.com/2016/03/discussion-on-web-caching/#prettyPhoto)
[缓存策略 - 腾讯Web前端 IMWeb 团队社区 | blog | 团队博客](http://imweb.io/topic/55c6f9bac222e3af6ce235b9)

Web 缓存分类：数据库缓存、代理服务器缓存、CDN缓存、浏览器缓存

浏览器缓存：

- 本地缓存
- 协商缓存
- 缓存失败
页面的缓存状态是由 header 决定的

_本地缓存阶段：_

1. *Cache-Control*
Max-age:指定设置缓存的最大时间（S）会覆盖 expires
S-maxage（S）只用于共享缓存（CDN）比如当s-maxage=60时，在这60s 里即使CDN更新了内容浏览器也不会请求。max-age用于普通缓存，而s-maxage用于代理缓存。如果存在s-maxage，则会覆盖掉max-age和Expires header。
public 指定响应会被缓存，并且在多用户间共享
Private只作为私有缓存
No-cache：不是不缓存，而是在缓存前向服务器确认资源是否更新，如果没有更新就不缓存
No-store：绝对禁止缓存，每次都要从服务器重新拉取资源

2. *Expires*
缓存过期时间，用来指定资源到期的时间，是服务器端的具体的时间点。也就是说，Expires=max-age + 请求时间，需要和Last-modified结合使用。但在上面我们提到过，cache-control的优先级更高。 Expires是Web服务器响应消息头字段，在响应http请求时告诉浏览器在过期时间前浏览器可以直接从浏览器缓存取数据，而无需再次请求。

_*协商缓存阶段：*_

1. Last-modified 
服务器上一次更新缓存的时间，需要和 cache-control 一起用，是检查服务器资源是否更新的一种方式。当浏览器再次请求时，会向服务器传送`If-Modified-Since`报头，询问Last-modified时间之后是否有被修改过，如果没有修改返回304，使用缓存；如果修改过，返回200，再次请求资源。

2. E-tag(Entity Tag)
根据实体内容生成的一段 hash 字符串，标志资源的状态，由服务端产生。浏览器会将这串字符串传回服务器，验证资源是否已经修改，服务器检查E-tag，如果没有修改返回304+空响应。
使用 E-tag 可以解决 Last-modified 的一些问题：

- 某些服务器不能精确得到资源的最后修改时间，这样就无法通过修改时间自由判断资源是否更新
- 如果资源更新非常频繁，在秒以下的时间内修改，而 Last-modified 只能精确到秒
- 一些资源的最后修改时间变了但是资源内容没有变，使用 E-tag 就认为资源还是没有修改。

*服务器端缓存：*

CDN缓存，也叫网关缓存、反向代理缓存。浏览器先向CDN网关发起WEB请求，网关服务器后面对应着一台或多台负载均衡源服务器，会根据它们的负载请求，动态地请求转发到合适的源服务器上。
CDN的优势
CDN节点解决了跨运营商和跨地域访问的问题，访问延时大大降低；
大部分请求在CDN边缘节点完成，CDN起到了分流作用，减轻了源站的负载。
