# 缓冲区基础知识点

## 前置了解的概念

### bit和byte认知
- bit 是 二进制数据单位
- 1 byte(字节)   = 8 bit
- 1个英文字母 = 1 byte = 8 bit
- 1个中文汉字 = 2 byte = 16 bit

### Buffer 缓冲区
- 缓和冲击区域，用于处理速度平衡, 起到流量整形的作用。
- 例如生产者和消费者模式中，缓存生产大于消费过程的中间地带。


## 前置了解的API

### ArrayBuffer
- 用来表示通用的、固定长度的原始二进制数据缓冲区
- [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

```js
// 创建一个 5字节(8x5=40bit)长度的缓冲区
var buffer = new ArrayBuffer(5);

// 将会输出缓冲区的长度 5
console.log(buffer.byteLength);
```

### DataView

- 二进制内存缓冲区视图
- [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)

### Uint8Array

- 8位无符号整型数组-缓冲区操作视图
- [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)


### TextEncoder

- 编码转码，将字符串转成二进制缓冲区里的数据流
- [MDN文档: TextEncoder](https://developer.mozilla.org/zh-CN/docs/Web/API/TextEncoder)


### TextDecoder
- 编码解码，将二进制缓冲区里的数据流转成字符串
- [MDN文档: TextDecoder](https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder)





