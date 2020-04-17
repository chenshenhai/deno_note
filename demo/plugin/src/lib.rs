#[macro_use]
extern crate deno_core;
extern crate futures;

use deno_core::CoreOp;
use deno_core::Op;
use deno_core::PluginInitContext;
use deno_core::{Buf, ZeroCopyBuf};
use futures::future::FutureExt;

// 初始化
fn init(context: &mut dyn PluginInitContext) {
  // 注册方法名为 testSync 的插件同步调用方法
  context.register_op("testSync", Box::new(op_test_sync));
  // 注册方法名为 testAsync 的插件异步调用方法
  context.register_op("testAsync", Box::new(op_test_async));
}
init_fn!(init);

// 定义插件的同步方法
pub fn op_test_sync(data: &[u8], zero_copy: Option<ZeroCopyBuf>) -> CoreOp {

  // 解析接收到的两个 参数信息，转换成字符串
  let controll = std::str::from_utf8(&data[..]).unwrap().to_string();
  let &mut opts;
  match zero_copy {
    // 如果为空
    None => opts = "".to_string(), 
    // 如果存在
    Some(buf) => opts = std::str::from_utf8(&buf[..]).unwrap().to_string(), 
  }

  // 打印接收到的 两个参数
  println!("[Rust] op_test_sync:receive (\"{}\", \"{}\")", controll, opts);

  // 返回结果
  let result = b"ok!";
  let result_box: Buf = Box::new(*result);

  Op::Sync(result_box)
}

// 定义插件的异步方法
pub fn op_test_async(data: &[u8], zero_copy: Option<ZeroCopyBuf>) -> CoreOp {

  // 解析接收到的第一个 参数信息，转换成字符串
  let controll = std::str::from_utf8(&data[..]).unwrap().to_string();

  let fut = async move {
    // 异步解析第二个参数
    if let Some(buf) = zero_copy {
      let opts = std::str::from_utf8(&buf[..]).unwrap();
      println!("[Rust] op_test_async:receive (\"{}\", \"{}\")", controll, opts);
    }
    let result = b"test";
    let result_box: Buf = Box::new(*result);
    // 结束异步操作
    Ok(result_box)
  };

  Op::Async(fut.boxed())
}