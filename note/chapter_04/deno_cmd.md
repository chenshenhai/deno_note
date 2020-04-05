# Deno常用命令简介

## 前言


安装了`Deno`(v0.7.0+)之后，执行帮助`deno -h`命令，就可以看到相关的命令参数列表

```sh
> deno -h

deno 0.39.0
A secure JavaScript and TypeScript runtime

Docs: https://deno.land/std/manual.md
Modules: https://deno.land/std/ https://deno.land/x/
Bugs: https://github.com/denoland/deno/issues

To start the REPL, supply no arguments:
  deno

To execute a script:
  deno run https://deno.land/std/examples/welcome.ts
  deno https://deno.land/std/examples/welcome.ts

To evaluate code in the shell:
  deno eval "console.log(30933 + 404)"

Run 'deno help run' for 'run'-specific flags.

USAGE:
    deno [OPTIONS] [SUBCOMMAND]

OPTIONS:
    -h, --help                     Prints help information
    -L, --log-level <log-level>    Set log level [possible values: debug, info]
    -q, --quiet                    Suppress diagnostic output
    -V, --version                  Prints version information

SUBCOMMANDS:
    bundle         Bundle module and dependencies into single file
    completions    Generate shell completions
    doc            Show documentation for module
    eval           Eval script
    fetch          Fetch the dependencies
    fmt            Format source files
    help           Prints this message or the help of the given subcommand(s)
    info           Show info about cache or info related to source file
    install        Install script as executable
    repl           Read Eval Print Loop
    run            Run a program given a filename or url to the module
    test           Run tests
    types          Print runtime TypeScript declarations
    upgrade        Upgrade deno executable to newest version

ENVIRONMENT VARIABLES:
    DENO_DIR       Set deno's base directory
    NO_COLOR       Set to disable color
    HTTP_PROXY     Proxy address for HTTP requests (module downloads, fetch)
    HTTPS_PROXY    Same but for HTTPS
```

## 使用方式

```sh
deno [子命令] [子命令的flags(可以多个)] [参数args]
```

例如`允许所有权限`执行脚本文件

```sh
deno run --allow-all mod.ts
```

例如`允许所有权限` + `重新加载编译` 执行脚本文件

```sh
deno run --allow-all  --reload mod.ts
```

 

## 子命令操作

### 子命令 run 

- 作用: 
    - 运行文件程序

- 说明: 
    - 通过一个js/ts 的文件路径或者线上URL路径，来运行一个程序

```sh
deno run mod.ts


demo run https://xxx.xx/mod.ts
```


#### 子命令 run 帮助说明

```sh
> deno run -h

# 会出现以下说明

deno-run 
Run a program given a filename or url to the source code.

By default all programs are run in sandbox without access to disk, network or
ability to spawn subprocesses.

  deno run https://deno.land/std/examples/welcome.ts

With all permissions

  deno run -A https://deno.land/std/http/file_server.ts

With only permission to read from disk and listen to network

  deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts

With only permission to read whitelist files from disk

  deno run --allow-read=/etc https://deno.land/std/http/file_server.ts

Any arguments that should be passed to the script should be prefixed by '--'

  deno run -A https://deno.land/std/examples/cat.ts -- /etc/passwd

USAGE:
    deno run [OPTIONS] [SCRIPT] [-- <SCRIPT_ARGS>...]

OPTIONS:
    -A, --allow-all                    Allow all permissions
        --allow-env                    Allow environment access
        --allow-hrtime                 Allow high resolution time measurement
        --allow-net=<allow-net>        Allow network access
        --allow-plugin                 Allow loading plugins
        --allow-read=<allow-read>      Allow file system read access
        --allow-run                    Allow running subprocesses
        --allow-write=<allow-write>    Allow file system write access
        --cached-only                  Require that remote dependencies are already cached
    -c, --config <FILE>                Load tsconfig.json configuration file
        --current-thread               Use tokio::runtime::current_thread
    -h, --help                         Prints help information
        --importmap <FILE>             Load import map file
        --lock <FILE>                  Check the specified lock file
        --lock-write                   Write lock file. Use with --lock.
    -L, --log-level <log-level>        Set log level [possible values: debug, info]
        --no-remote                    Do not resolve remote modules
    -r, --reload=<CACHE_BLACKLIST>     Reload source code cache (recompile TypeScript)
        --seed <NUMBER>                Seed Math.random()
        --v8-flags=<v8-flags>          Set V8 command line options. For help: --v8-flags=--help

ARGS:
    <SCRIPT>            script
    <SCRIPT_ARGS>...    script args
```

#### run 主要功能

- 编译`ts`成`js`代码和`sourceMap`文件，存在 `$HOME/.deno/gen/` 目录下
- 并且`js`和 `sourceMap`文件 都是以`hash`值命名的 
- 只要代码不做变更，都会一直执行编译后的文件
- 如果代码变更了，会重新执行编译，并且生成新的`hash`命名的`js`和`sourceMap`文件

##### run 权限相关flags

- `deno run --allow-net mod.ts` 执行代码 允许直接使用网络权限
- `deno run --allow-read mod.ts` 执行代码 允许直接使用文件读权限
- `deno run --allow-write mod.ts` 执行代码 允许直接使用文件写权限
- `deno run --allow-run mod.ts` 执行代码 允许直接执行子程序
- `deno run --allow-env mod.ts` 执行代码 允许直接使用操作环境权限
- `deno run --allow-run mod.ts` 执行代码 允许执行子进程
- `deno run --allow-hrtime mod.ts` 执行代码 允许测量高分辨率时间
- `deno run --allow-all mod.ts` 执行代码 允许以上所有权限

##### run 其他flags

- `deno run -h` 查看帮助文档
- `deno run -D mod.ts` 或 `deno --log-debug` 输出执行底层日志
- `deno run --no-prompt mod.ts` 执行代码时不显示提示
- `deno run --v8-flags mod.ts` 设置V8命令行参数


### 子命令 eval

- 作用: 直接执行脚本代码的字符串

例如:

```sh
deno eval "console.log('hello world! ' + new Date().getTime())"
```


```sh
> deno run -h

# 会出现以下说明
USAGE:
    deno eval [FLAGS] [OPTIONS] <code>

FLAGS:
    -h, --help          Prints help information
    -D, --log-debug     Log debug output
    -r, --reload        Reload source code cache (recompile TypeScript)
        --v8-options    Print V8 command line options

OPTIONS:
    -c, --config <FILE>          Load compiler configuration file
        --v8-flags=<v8-flags>    Set V8 command line options

ARGS:
    <code>  

```


### 子命令fetch

- 作用: 
    - 获取远程在线的依赖模块
- 说明: 
    - 下载和编译远程依赖模块，并保存在本地
    - 以及递归获取和编译模块的所有依赖
    - 编译后无需运行代码
    - 在后续项目程序应用相同远程代码时候，无需重新下载和编译，除非使用了`--reload`的flag



#### fetch 使用方式

```sh
deno fetch https://deno.land/welcome.ts
# 1. 将会把 https://deno.land/welcome.ts 下载到本地
# 2. 下载后会编译成js，缓存在本地
# 3. 再次执行 deno fetch https://deno.land/welcome.ts，将会直接从缓存获取
# 4. 本地其他项目如果有 import 'https://deno.land/welcome.ts' 的时候，将会直接从缓存获取


deno fetch --reload https://deno.land/welcome.ts
# 1. 将会重新把 https://deno.land/welcome.ts 下载到本地
# 2. 下载后会编译成js，覆盖上一次的缓存
```


### 子命令 fmt

- 作用:
    - 自动格式化`Deno`项目`JavaScript`和`TypeScript` 源码格式

#### fmt 使用方式

```sh
deno fmt mod.ts 

# 将会格式化 mod.ts 的源码格式
```


### 子命令 info

- 作用:
    - 显示`Deno`项目代码文件的相关信息
- 说明
    - `local` 支持显示文件在本地的绝对路径
    - `type` 支持显示文件类型，主要支持 `JavaScript`, `TypeScript` 和 `JSON` 三种格式
    - `compiled` 只支持`TypeScript`类型的文件，显示`TypeScript`编译后`JavaScript`代码文件在本地的绝对路径
    - `map` 只支持`TypeScript`类型的文件，显示`TypeScript`编译后`sourceMap`文件在本地的绝对路径
    - `deps` 支持显示文件里代码的依赖模块，并显示依赖树

#### info 使用方式

```sh
deno info mod.ts 

# 将会显示对应的文件信息
# 例如
local: /Users/xxx/mod.ts
type: TypeScript
compiled: /Users/xxx/Library/Caches/deno/gen/${md5}.js
map: /Users/xxx/Library/Caches/deno/gen/${md5}.js.map
deps:
file:///Users/xxx/mod.ts
  └─┬ file:///Users/xxx/dep_01.ts
    ├─┬ file:///Users/xxx/dep_02.ts
    │ └─┬ file:///Users/xxx/dep_03.ts
    │   ├─┬ file:///Users/xxx/dep_04.ts
    │   │ └── file:///Users/xxx/dep_05.ts
    │   └── file:///Users/xxx/dep_06.ts
    ├─┬ file:///Users/xxx/dep_07.ts
    │ └── file:///Users/xxx/dep_08.ts
    └── file:///Users/xxx/dep_09.ts
```



