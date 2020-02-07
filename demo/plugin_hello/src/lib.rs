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
  if let Some(buf) = zero_copy {
    let data_str = std::str::from_utf8(&data[..]).unwrap();
    let buf_str = std::str::from_utf8(&buf[..]).unwrap();
    println!(
      "op_test_sync: data: {} | zero_copy: {}",
      data_str, buf_str
    );
  }
  let result = b"test_sync";
  let result_box: Buf = Box::new(*result);
  Op::Sync(result_box)
}

// 定义插件的异步方法
pub fn op_test_async(data: &[u8], zero_copy: Option<ZeroCopyBuf>) -> CoreOp {
  let data_str = std::str::from_utf8(&data[..]).unwrap().to_string();
  let fut = async move {
    if let Some(buf) = zero_copy {
      let buf_str = std::str::from_utf8(&buf[..]).unwrap();
      println!(
        "op_test_async: data: {} | zero_copy: {}",
        data_str, buf_str
      );
    }
    let result = b"test";
    let result_box: Buf = Box::new(*result);
    Ok(result_box)
  };

  Op::Async(fut.boxed())
}