extern crate deno_core;
extern crate futures;

use deno_core::Op;
use deno_core::CoreIsolate;
use deno_core::{Buf, ZeroCopyBuf};
use futures::future::FutureExt;

// 初始化
#[no_mangle]
pub fn deno_plugin_init(isolate: &mut CoreIsolate) {
  isolate.register_op("testSync", op_test_sync);
  isolate.register_op("testAsync", op_test_async);
}

// 定义插件的同步方法
pub fn op_test_sync(
  _isolate: &mut CoreIsolate,
  data: &[u8], 
  zero_copy: Option<ZeroCopyBuf>
) -> Op {
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
pub fn op_test_async(
  _isolate: &mut CoreIsolate,
  data: &[u8],
  zero_copy: Option<ZeroCopyBuf>,
) -> Op {
  // 解析接收到的第一个 参数信息，转换成字符串
  let data_str = std::str::from_utf8(&data[..]).unwrap().to_string();
  let fut = async move {
    // 异步解析第二个参数
    if let Some(buf) = zero_copy {
      let opts = std::str::from_utf8(&buf[..]).unwrap();
      println!("[Rust] op_test_async:receive (\"{}\", \"{}\")", data_str, opts);
    }
    let (tx, rx) = futures::channel::oneshot::channel::<Result<(), ()>>();
    std::thread::spawn(move || {
      std::thread::sleep(std::time::Duration::from_secs(1));
      // 结束异步操作
      tx.send(Ok(())).unwrap();
    });
    assert!(rx.await.is_ok());
    let result = b"test";
    let result_box: Buf = Box::new(*result);
    result_box
  };

  Op::Async(fut.boxed())
}