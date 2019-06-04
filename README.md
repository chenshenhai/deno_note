# Deno进阶开发笔记 (不定时更新)

[![Build Status](https://travis-ci.com/chenshenhai/deno_note.svg?token=XYNG2F1URZ4nW1TzoJNC&branch=master)](https://travis-ci.com/chenshenhai/deno_note)
[![Build Status](https://dev.azure.com/chenshenhai/chenshenhai/_apis/build/status/chenshenhai.deno_note?branchName=master)](https://dev.azure.com/chenshenhai/chenshenhai/_build/latest?definitionId=1&branchName=master)

<hr/>

<img  width="240"  src="https://user-images.githubusercontent.com/8216630/52873226-771a3e80-3189-11e9-9bf9-59de7091dbfa.png">


<hr/>

## 阅读须知

截至 2019年6月初，本书用的是`Deno@v0.3.4`环境，而`Deno`官方更新节奏是每周一个小版本迭代，已经到了`v0.7.0`，原有教程代码大部分执行不兼容，需要重构一番。

本笔记教程在没完成升级`v0.7.0`之前，不建议直接git clone 学习。
如果想跑起所有demo案例，必须保证在`Deno@v0.3.4`的环境里使用。

## 本书目标

- 一本关于`Deno`的技术开发入门教程
- 从实际 `应用开发` 层面去学习`Deno`的使用，暂时不会深究底层原理
- 以 `Deno` 原生的能力实现相关代码，不依赖`deno_std`(单元测试除外)  
- 以 `TDD` 开发模式结合集成测试保证 例子demo适应各种生产环境

## 关于作者
- [关于作者(我)](https://chenshenhai.github.io)
- [关于作者(我) GitHub](https://github.com/chenshenhai)
- 本书笔记内容不定时更新，如果想第一时间知道本书进展，可以 `watch` 本项目 或者 [关注公众号](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_01/01.md#关注本书)。

## 免责声明

目前，本书内容属于学习笔记资料，不建议用于生产环境。因为`Deno`官方功能处于开发阶段，所以本书正处于和将长期处于更新阶段，里面代码内容不建议用于生产环境，但我也希望有开发者能用于生产环境经验，并分享相关的实战经验。

## 目录

* 1 致读者
    * [1.1 本书初衷](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_01/01.md)
    * [1.2 参考资料](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_01/02.md)
* 2 快速开始
    * [2.1 快速安装](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_02/01.md)
    * [2.2 快速使用](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_02/02.md)
* 3 前置基础知识
    * [3.1 Deno和Node.js](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_03/01.md)
    * [3.2 缓冲区基础知识点](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_03/02.md)
    * [3.3 TypeScript基础](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_03/03.md)
* 4 Deno基础知识点
    * [4.1 Deno常用命令简介](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/01.md)
    * [4.2 Deno模块体系](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/02.md)
    * [4.3 window全局API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/03.md)
    * [4.4 Deno平台API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/04.md)
    * [4.5 Deno系统API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/05.md)
    * [4.6 Deno文件操作API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/06.md)
    * [4.7 Deno目录操作API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/07.md)
    * [4.8 Deno删除操作API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/08.md)
    * [4.9 Deno进程操作API](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_04/09.md)
    * [4.x Deno其他常用API] `// TODO`
* 5 基础进阶学习
    * [5.1 单元测试](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/01.md)
    * [5.2 单元测试进阶](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/02.md)
    * [5.3 集成测试](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/03.md)
    * [5.4 文件/目录操作](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/04.md)
    * [5.5 Buffer进阶读操作](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/05.md)
    * [5.6 Buffer进阶写操作] `// TODO`
    * [5.7 原生Deno实现简单HTTP服务](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/07.md)
    * [5.8 原生Deno处理HTTP请求](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/08.md)
    * [5.9 原生Deno处理HTTP响应](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/09.md)
    * [5.10 原生Deno实现稳定HTTP服务](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_05/10.md)
* 6 WEB进阶开发
    * [6.1 中间件式框架简单实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/01.md)
    * [6.2 中间件-路由实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/02.md)
    * [6.3 中间件-静态资源实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_06/03.md)
    * [6.4 HTML模板编译实现]  `// TODO`
    * [6.5 文件同步上传功能实现]  `// TODO`
    * [6.6 文件异步上传功能实现]  `// TODO`
* 7 工具类开发
    * [7.1 Linux系统下CLI功能实现](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_07/01.md) 
    * [7.2 MySQL通信]   `// TODO`
* 8 发布模块
    * [8.1 GitHub发布模块版本]  `// TODO`
    * [8.2 其他发布方式]  `// TODO`


## 前言

- Deno自2018年6月诞生，引发JavaScript开发社区的强烈讨论，很多开发者误解甚至还纷纷传言`ry`大神将以`Deno`作为下一代`Node.js`，甚至还闹出了啼笑皆非的`issue`盖楼闹剧。
- 到了2018年底至2019年初，在JavaScript社区里，deno的相关讨论声音渐渐消退，更多是谈论`TypeScript`是否将引领下一波前端开发潮流，甚至带动`Deno`起飞。

## 为啥要写这本书  

- 既然有新东西可以玩，先不管别人怎么议论，工具好不好得自己用了才知道。面对一个新生技术，人云亦云和断章取义不是一个技术开发者的应有的行为。
- 趁着2019年春节在家，好好利用这个“寒假”玩玩这个新技术。截止2019年初，`Deno`国内外资料实在太少。
    - 除了出现 [《deno核心指南》](https://github.com/denolib/guide) 以及对应的GitHub组织`denolib`推荐的学习文档比较有建设性，除此之外，对于deno的开发资料乏善可陈。
  - `Deno`基本模块和官方标准模块 `deno_std` [deno_std](https://github.com/denoland/deno_std) 处于开发中不稳定状态，存在一堆`// TODO` 的代码和`API`频繁变更的不定性。
- 2019年春节期间 硬生生啃了好几个国外 `Deno` 试验项目仓库。写下这本《deno进阶开发笔记》，一来是作为自己学习`Deno`的笔记记录，二来希望能给`Deno`开发社区添砖加瓦。


## 本书特点

既然 `Deno` 官方主旨是为现代程序员提供高效，安全的脚本环境。以本书日常`WEB`开发，工具开发的常用功能实现为主。

- `TDD`开发例子，功能例子都以 `TDD(Test-Driven Development)` 开发模式为主，一个功能模块，配备对应的单元测试。
- `Travis CI build`，用于集成构建测试在`Linux`环境下所有单元测试
- `Azure Pipelines`，用于集成构建测试在`Window|Mac|Ubuntu`环境下所有单元测试，保证例子在各个生产环境都能正常执行。

