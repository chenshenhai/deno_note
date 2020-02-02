# plugin

```sh

## 编译插件
## 注意: 目前系统: MacOS@v10.15.x,  rustc@v1.41.0
cargo build

## 执行rust测试
cargo test RUST_BACKTRACE=1

## 进入测试目录
cd tests/
## 执行deno插件调用测试
deno --allow-plugin test.js debug

```