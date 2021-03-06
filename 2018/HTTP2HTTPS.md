# HTTP -> HTTPS 
## HTTP的缺点：

- 通信使用明文（不加密），内容可能会被窃听
- 不验证通信方的身份，因此有可能遭遇伪装
- 无法证明报文的完整性，所以有可能已遭篡改

##  通信使用明文可能会被窃听；
由于HTTP本身不具备加密的功能，所以也无法做到对通信整体（使用HTTP协议通信的请求和相应的内容）进行加密，即使用明文发送。

1. **通信的加密**

将通信加密

HTTP可以通过和SSL（Secure Socket Layer，安全套接层）或TLS（Transport Layer Security，安全传输层协议）的组合使用，加密 HTTP 的通信内容。

与 SSL 组合使用的 HTTP 被称为 HTTPS（HTTP Secure，超文本传输安全协议）或 HTTP over SSL。

2. **内容的加密**

将参与通信的内容本身加密。由于HTTP协议中没有加密机制，那么就对HTTP协议传输的内容进行加密。即把 HTTP 报文里包含的内容进行加密处理。

这要求服务端和客户端同时具备加密和解密机制。主要应用在 web 服务中。

### 不验证通信方的身份，因此有可能遭遇伪装
1. 任何人都可以发起请求
在 HTTP 协议通信中，由于不存在确认通信放的步骤处理，任何人都可以发起请求。
2. 查明证书
SSL提供了”证书“手段，证书由值得信任的第三方机构颁发，用以证明服务端和客户端是真实存在的。

### 无法证明报文的完整性，所以有可能已遭篡改
**如何防止篡改：**

最常用的是MD5和SHA-1等散列值校验的方法，以及用来确认文件的数字签名方法。

- PGP（Pretty Good Privacy，完美隐私）用来证明创建文件的数字签名。
- MD5算法由单项函数生成散列值。

## HTTPS = HTTP + 加密 + 认证 + 完整性保护
HTTPS是身披SSL 外壳的 HTTP。

通常 HTTP 直接和 TCP 通信，当使用 SSL 时，则演变成先和 SSL 通信，再由 SSL 和 TCP 通信。

## SSL

SSL 是独立于 HTTP 的协议，是当今世界上应用最广泛的网络安全技术。
SSL采用公开密钥加密的加密处理方式。

- **共享秘钥加密：** 加密和解密用同一个密钥的方式叫做共享秘钥加密（对称密钥加密）。
- **公开密钥加密：**使用一对非对称的密钥：私有密钥和公开密钥。
发送密钥的一方使用对方的公开密钥进行加密，对方收到加密的信息后，再使用自己的私有密钥进行解密。

HTTPS采用 **共享秘钥加密** 和 **公开密钥加密** 两者并用的混合加密机制。

HTTPS中还可以使用客户端证书。

## HTTPS 的安全通信机制

**三次握手：**
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

