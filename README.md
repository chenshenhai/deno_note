# Deno进阶开发笔记 (不定时更新)

[![Build Status](https://travis-ci.com/chenshenhai/deno_note.svg?token=XYNG2F1URZ4nW1TzoJNC&branch=master)](https://travis-ci.com/chenshenhai/deno_note)
[![Build Status](https://dev.azure.com/chenshenhai/chenshenhai/_apis/build/status/chenshenhai.deno_note?branchName=master)](https://dev.azure.com/chenshenhai/chenshenhai/_build/latest?definitionId=1&branchName=master)

<hr/>

![deno_note_logo](./note/image/deno-mini.jpg)

<hr/>

## 阅读须知

截至 2020年6月上旬，本笔记教程用的是`Deno@v1.0.4`，如需本地运行demo实例，请保证在您电脑本地的运行环境是`Deno@v1.0.4`

## 本书目标

- 一本关于`Deno`的技术开发入门教程
- 从实际 `应用开发` 层面去学习`Deno`的使用，暂时不会深究底层原理
- 以 `Deno` 原生的能力实现相关代码，不依赖`deno_std`(单元测试除外)  
- 以 `TDD` 开发模式结合集成测试保证 例子demo适应各种生产环境

## 关于作者
- [关于作者(我)](https://chenshenhai.com)
- [关于作者(我) GitHub](https://github.com/chenshenhai)
- 本书便捷阅读入口 [https://chenshenhai.com/deno_note](https://chenshenhai.com/deno_note)
- 本书笔记内容不定时更新，如果想第一时间知道本书进展，可以 `watch` 本项目 或者 [关注公众号](https://github.com/chenshenhai/deno_note/blob/master/note/chapter_01/01.md#关注本书)。

## 免责声明

目前，本书内容属于学习笔记资料，不建议用于生产环境。因为`Deno`官方功能处于开发阶段，所以本书正处于和将长期处于更新阶段，里面代码内容不建议用于生产环境，但我也希望有开发者能用于生产环境经验，并分享相关的实战经验。

本书协议 [LICENSE MIT](./LICENSE)

## 目录

* [1 致读者]
    * [1.1 本书初衷](./note/chapter_01/01.md)
    * [1.2 参考资料](./note/chapter_01/02.md)
* [2 快速开始]
    * [2.1 快速安装](./note/chapter_02/install.md)
    * [2.2 快速使用](./note/chapter_02/start.md)
* [3 前置基础知识]
    * [3.1 Deno和Node.js](./note/chapter_03/nodejs_compare.md)
    * [3.2 缓冲区基础知识点](./note/chapter_03/buffer_info.md)
    * [3.3 TypeScript基础](./note/chapter_03/ts_basic.md)
    * [3.4 Deno常见问题点](./note/chapter_03/deno_faq.md)
* [4 Deno基础知识点]
    * [4.1 Deno常用命令简介](./note/chapter_04/deno_cmd.md)
    * [4.2 Deno模块体系](./note/chapter_04/deno_mod.md)
    * [4.3 window全局API](./note/chapter_04/deno_window_api.md)
    * [4.4 Deno系统信息](./note/chapter_04/deno_api_sys.md)
    * [4.5 Deno文件操作](./note/chapter_04/deno_api_fs.md)
    * [4.6 Deno目录操作](./note/chapter_04/deno_api_dir.md)
    * [4.7 Deno删除操作](./note/chapter_04/deno_api_del.md)
    * [4.8 Deno进程操作](./note/chapter_04/deno_api_process.md)
    * [4.9 Deno使用import-maps](./note/chapter_04/deno_import_maps.md)
* [5 基础进阶学习]
    * [5.1 开发Debug](./note/chapter_05/debug.md)
    * [5.2 单元测试](./note/chapter_05/testing.md)
    * [5.3 单元测试进阶](./note/chapter_05/testing_unit.md)
    * [5.4 集成测试](./note/chapter_05/testing_integrate.md)
    * [5.5 文件/目录操作](./note/chapter_05/fs_dir.md)
    * [5.6 Buffer进阶读操作](./note/chapter_05/buffer_reader.md)
    * [5.7 原生Deno实现简单HTTP服务](./note/chapter_05/http_simple.md)
    * [5.8 原生Deno处理HTTP请求](./note/chapter_05/http_request.md)
    * [5.9 原生Deno处理HTTP响应](./note/chapter_05/http_response.md)
    * [5.10 原生Deno实现稳定HTTP服务](./note/chapter_05/http_stable.md)
* [6 WEB进阶开发]
    * [6.1 中间件式框架简单实现](./note/chapter_06/web_framework_middleware.md)
    * [6.2 中间件-路由实现](./note/chapter_06/web_framework_router.md)
    * [6.3 中间件-静态资源实现](./note/chapter_06/web_framework_static.md)
    * [6.4 表单文件上传功能实现](./note/chapter_06/web_upload.md)
    * [6.5 异步文件上传功能实现](./note/chapter_06/web_upload_async.md)
    * [6.x HTML模板编译实现]
* [7 工具类开发]
    * [7.1 Linux系统下CLI原始功能实现](./note/chapter_07/deno_cli.md)  
    * [7.2 终端输入/输出 效果处理](./note/chapter_07/deno_cmd.md) 
* [8 Rust插件开发]
    * [8.1 插件开发入门](./note/chapter_08/deno_plugin_dev.md)  
    * [8.2 Rust基础学习]
* [9 生态]
    * [9.1 Deno借助jspm使用npm](./note/chapter_09/use_npm_by_jspm.md) 

## 为啥要写这本书  

- 2020年 感想
    - Deno官方API基本稳定下来，也官宣将于2020年5月13日两周年之际发布 1.0 版本
    - Deno官方也出了 API 的使用文档 [Deno官方API文档](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts)
    - 意味着 Deno 趋近完善，后续用于生产环境指日可待
- 2019年 感想
    - Deno自2018年6月诞生，引发JavaScript开发社区的强烈讨论，很多开发者误解甚至还纷纷传言`ry`大神将以`Deno`作为下一代`Node.js`，甚至还闹出了啼笑皆非的`issue`盖楼闹剧。
    - 到了2018年底至2019年初，在JavaScript社区里，Deno的相关讨论声音渐渐消退，更多是谈论`TypeScript`是否将引领下一波前端开发潮流，甚至带动`Deno`起飞。
    - 既然有新东西可以玩，先不管别人怎么议论，工具好不好得自己用了才知道。面对一个新生技术，人云亦云和断章取义不是一个技术开发者的应有的行为。
    - 趁着2019年春节在家，好好利用这个“寒假”玩玩这个新技术。截止2019年初，`Deno`国内外资料实在太少。
        - 除了出现 [《Deno核心指南》](https://github.com/denolib/guide) 以及对应的GitHub组织`denolib`推荐的学习文档比较有建设性，除此之外，对于deno的开发资料乏善可陈。
    - `Deno`基本模块和官方标准模块 `deno_std` [deno_std](https://github.com/denoland/deno_std) 处于开发中不稳定状态，存在一堆`// TODO` 的代码和`API`频繁变更的不定性。
    - 2019年春节期间 硬生生啃了好几个国外 `Deno` 试验项目仓库。写下这本《Deno进阶开发笔记》，一来是作为自己学习`Deno`的笔记记录，二来希望能给`Deno`开发社区添砖加瓦。


## 本书特点

既然 `Deno` 官方主旨是为现代程序员提供高效，安全的脚本环境。以本书日常`WEB`开发，工具开发的常用功能实现为主。

- `TDD`开发例子，功能例子都以 `TDD(Test-Driven Development)` 开发模式为主，一个功能模块，配备对应的单元测试。
- `Travis CI build`，用于集成构建测试在`Linux`环境下所有单元测试
- `Azure Pipelines`，用于集成构建测试在`Window|Mac|Ubuntu`环境下所有单元测试，保证例子在各个生产环境都能正常执行。

