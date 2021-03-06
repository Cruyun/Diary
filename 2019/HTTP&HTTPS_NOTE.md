# 图解HTTP笔记 -> HTTPS 

## HTTP的缺点：

- 通信使用明文（不加密），内容可能会被窃听
- 不验证通信方的身份，因此有可能遭遇伪装
- 无法证明报文的完整性，所以有可能已遭篡改

HTTPS 的作用

* *内容加密*建立一个信息安全通道，来保证数据传输的安全；
* *身份认证*确认网站的真实性
* *数据完整性*防止内容被第三方冒充或者篡改

HTTPS和HTTP的区别

* https协议需要到CA申请证书，一般免费证书很少，需要交费。
* http是超文本传输协议，信息是明文传输；https 则是具有安全性的ssl加密传输协议。
* http和https使用的是完全不同的连接方式，用的端口也不一样，前者是80，后者是443。
* http的连接很简单，是无状态的；HTTPS协议是由SSL+HTTP协议构建的可进行加密传输、身份认证的网络协议，比http协议安全。

##  通信使用明文可能会被窃听；
由于HTTP本身不具备加密的功能，所以也无法做到对通信整体（使用HTTP协议通信的请求和相应的内容）进行加密，即使用明文发送。

1. *通信的加密*
将通信加密
HTTP可以通过和SSL（Secure Socket Layer，安全套接层）或TLS（Transport Layer Security，安全传输层协议）的组合使用，加密 HTTP 的通信内容。

与 SSL 组合使用的 HTTP 被称为 HTTPS（HTTP Secure，超文本传输安全协议）或 HTTP over SSL。

2. *内容的加密*
将参与通信的内容本身加密。由于HTTP协议中没有加密机制，那么就对HTTP协议传输的内容进行加密。即把 HTTP 报文里包含的内容进行加密处理。

这要求服务端和客户端同时具备加密和解密机制。主要应用在 web 服务中。

### 不验证通信方的身份，因此有可能遭遇伪装
1. 任何人都可以发起请求
在 HTTP 协议通信中，由于不存在确认通信放的步骤处理，任何人都可以发起请求。
2. 查明证书
SSL提供了”证书“手段，证书由值得信任的第三方机构颁发，用以证明服务端和客户端是真实存在的。

### 无法证明报文的完整性，所以有可能已遭篡改

如何防止篡改：
最常用的是MD5和SHA-1等散列值校验的方法，以及用来确认文件的数字签名方法。

PGP（Pretty Good Privacy，完美隐私）用来证明创建文件的数字签名。
MD5算法由单项函数生成散列值。

## HTTPS = HTTP + 加密 + 认证 + 完整性保护

HTTPS是身披 SSL 外壳的 HTTP。
通常 HTTP 直接和 TCP 通信，当使用 SSL 时，则演变成先和 SSL 通信，再由 SSL 和 TCP 通信。

## SSL *(Secure Socket Layer，安全套接字层)*

SSL 是独立于 HTTP 的协议，是当今世界上应用最广泛的网络安全技术。
SSL采用公开密钥加密的加密处理方式。

- *共享秘钥加密：* 加密和解密用同一个密钥的方式叫做共享秘钥加密（对称密钥加密）。

- *公开密钥加密：*使用一对非对称的密钥：私有密钥和公开密钥。

发送密钥的一方使用对方的公开密钥进行加密，对方收到加密的信息后，再使用自己的私有密钥进行解密。

HTTPS采用 *共享秘钥加密*和*公开密钥加密*两者并用的混合加密机制。
HTTPS中还可以使用客户端证书。

## TLS (Transport Layer Security，传输层安全协议)

用于两个应用程序之间提供保密性和数据完整性。 
TLS 1.0是IETF（Internet Engineering Task Force，Internet工程任务组）制定的一种新的协议，它建立在SSL 3.0协议规范之上，是SSL 3.0的后续版本，可以理解为SSL 3.1，它是写入了 RFC 的。该协议由两层组成： TLS 记录协议（TLS Record）和 TLS 握手协议（TLS Handshake）。较低的层为 TLS 记录协议，位于某个可靠的传输协议（例如 TCP）上面。

## HTTPS 的安全通信机制

*三次握手：*

1. 客户端：发送Client Hello 报文开始 SSL 通信
服务端：发送Server Hello 报文作为应答。
服务端：发送 Certificate 报文。
服务端：发送 Server Hello Done 报文通知客户端。

2. 客户端：发送 Client Key Exchange 报文作为回应。

客户端：发送 Change Cipher Spec 报文（提醒服务器在此报文之后的通信会采用 Pre-master secret 密钥加密）
客户端：发送 Finished 报文。
服务器：发送 Change Cipher Spec 报文。
服务器：发送 Finished 报文。

3. 客户端：发送 HTTP 响应（Application Data）。

服务端：发送 HTTP 响应（Application Data）。

最后由客户端断开连接。


[Reference-1](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
[Reference-1](https://www.baidu.com/sf_bk/item/ca证书/10028741?fr=aladdin&ms=1&rid=9627370440075920029)
[Reference-1](http://cyc2018.gitee.io/cs-notes/#/notes/HTTP)

---

# Https
1，用非对称加密传递对称加密所用的秘钥
2，之后的环节用该对称加密秘钥加密

详解 4步

- 第一步客户端向服务端发送:
    一个随机数
    可用的加密方式（用于之后配合随机数生成会话秘钥）
- 第二步 服务端向客户端发送
    一个随机数
    最终选择的加密方式
    带有公钥的证书
- 第三步 客户端验证证书，验证没问题后从证书中拿到公钥，再生成另一个随机数，用公钥加密后，发送给服务端。

服务端拿到公钥加密的随机数3后，用私钥解密。
此时服务端和客户端都有3个随机数，他们都用之前商定的加密方式来将随机数加密，作为会话秘钥。
之后的通信用这个会话秘钥来进行对称加密。

- 第四步 服务端通知客户端之后开始用秘钥加密通信

之后的HTTP请求，服务端和客户端都会用之前得到的 会话秘钥 来进行对称加密与解密。

***
客户端如何验证证书？
1，首先看证书颁发机构，对应网址是否一致
2，之后对数字签名进行检查。
数字签名是CA先将 申请人信息和发给他的公钥一起 用Hash算法得到一个Hash值之后，再用CA自己的私钥加密得来的一个字符串。
客户端拿到数字签名之后，先用CA的公钥解密数字签名得到Hash值，再用相同的Hash方式对证书中 申请人信息和公钥一起 进行Hash，之后比较这两个Hash值，若一直，则说明证书没问题
***
