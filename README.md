# deno进阶开发笔记 (不定时更新)

[![Build Status](https://travis-ci.com/chenshenhai/deno_note.svg?token=XYNG2F1URZ4nW1TzoJNC&branch=master)](https://travis-ci.com/chenshenhai/deno_note)
[![Build Status](https://dev.azure.com/chenshenhai/chenshenhai/_apis/build/status/chenshenhai.deno_note?branchName=master)](https://dev.azure.com/chenshenhai/chenshenhai/_build/latest?definitionId=1&branchName=master)

<hr/>

<img  width="240"  src="https://user-images.githubusercontent.com/8216630/52873226-771a3e80-3189-11e9-9bf9-59de7091dbfa.png">


<hr/>

## 本书目标

- 从实际 `工程应用` 层面去学习`Deno`的使用
- 以 `TDD` 开发模式结合集成测试保证 例子demo适应各种生产环境


## 关于作者
- [关于作者(我)](https://chenshenhai.github.io)
- 本书笔记内容不定时更新，如果想第一时间知道本书进展，可以 `watch` 本项目 或者 [关注我公众号](./note/chapter_01/01.md#关注本书)。

## 目录

* 1 致读者
    * [1.1 本书初衷](./note/chapter_01/01.md)
    * [1.2 参考资料](./note/chapter_01/02.md)
* 2 快速开始
    * [2.1 快速安装](./note/chapter_02/01.md)
    * [2.2 快速使用](./note/chapter_02/02.md)
* 3 前置基础知识
    * [3.1 deno和Node.js](./note/chapter_03/01.md)
    * [3.2 缓冲区基础知识点](./note/chapter_03/02.md)
    * [3.3 TypeScript基础](./note/chapter_03/03.md)
* 4 deno基础知识点
    * [4.1 deno常用命令简介](./note/chapter_04/01.md)
    * [4.2 deno模块体系](./note/chapter_04/02.md)
    * [4.3 deno常用API简介] `// TODO`
* 5 基础进阶学习
    * [5.1 单元测试](./note/chapter_05/01.md)
    * [5.2 单元测试进阶](./note/chapter_05/02.md)
    * [5.3 集成测试](./note/chapter_05/03.md)
    * [5.4 文件/目录操作](./note/chapter_05/04.md)
    * [5.5 Buffer进阶读操作](./note/chapter_05/06.md)
    * [5.6 Buffer进阶写操作] `// TODO`
    * [5.7 原生deno实现简单HTTP服务](./note/chapter_05/07.md)
    * [5.8 原生deno处理HTTP请求](./note/chapter_05/08.md)
    * [5.9 原生deno处理HTTP响应](./note/chapter_05/09.md)
    * [5.10 原生deno实现稳定HTTP服务](./note/chapter_05/10.md)
* 6 WEB进阶开发
    * [6.1 中间件式框架简单实现]  `// TODO`
    * [6.2 中间件-路由实现]  `// TODO`
    * [6.3 中间件-静态资源实现]  `// TODO`
    * [6.4 HTML模板编译实现]  `// TODO`
    * [6.5 文件同步上传功能实现]  `// TODO`
    * [6.6 文件异步上传功能实现]  `// TODO`
* 7 工具类开发
    * [7.1 CLI功能实现]  `// TODO`
    * [7.2 MySQL通信]   `// TODO`
* 8 发布模块
    * [8.1 GitHub发布模块版本]  `// TODO`
    * [8.2 其他发布方式]  `// TODO`


## 前言

- deno自2018年6月诞生，引发JavaScript开发社区的强烈讨论，很多开发者误解甚至还纷纷传言`ry`大神将以`Deno`作为下一代`Node.js`，甚至还闹出了啼笑皆非的`issue`盖楼闹剧。
- 到了2018年底至2019年初，在JavaScript社区里，deno的相关讨论声音渐渐消退，更多是谈论`TypeScript`是否将引领下一波前端开发潮流，甚至带动`Deno`起飞。

## 为啥要写这本书  

- 既然有新东西可以玩，先不管别人怎么议论，工具好不好得自己用了才知道。面对一个新生技术，人云亦云和断章取义不是一个技术开发者的应有的行为。
- 趁着2019年春节在家，好好利用这个“寒假”玩玩这个新技术。截止2019年初，`Deno`国内外资料实在太少。
  - 除了出现 [《deno核心指南》](https://github.com/denolib/guide) 以及对应的GitHub组织`denolib`推荐的学习文档比较有建设性，除此之外，对于deno的开发资料乏善可陈。
  - `Deno`基本模块和官方标准模块 `deno_std` 处于开发中不稳定状态，存在一堆` `// TODO`` 的代码
- 2019年春节期间 硬生生啃了好几个国外 `Deno` 试验项目仓库。写下这本《deno进阶开发笔记》，一来是作为自己学习`Deno`的笔记记录，二来希望能给`Deno`开发社区添砖加瓦。


## 本书特点

既然 `Deno` 官方主旨是为现代程序员提供高效，安全的脚本环境。以本书日常`WEB`开发，工具开发的常用功能实现为主。

- `TDD`开发例子，功能例子都以 `TDD(Test-Driven Development)` 开发模式为主，一个功能模块，配备对应的单元测试。
- `Travis CI build`，用于集成构建测试在`Linux`环境下所有单元测试
- `Azure Pipelines`，用于集成构建测试在`Window|Mac|Ubuntu`环境下所有单元测试，保证例子在各个生产环境都能正常执行。

