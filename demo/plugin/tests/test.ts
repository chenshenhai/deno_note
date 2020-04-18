const filenameBase = "libplugin";

let filenameSuffix = ".so";
let filenamePrefix = "lib";

if (Deno.build.os === "win") {
  filenameSuffix = ".dll";
  filenamePrefix = "";
}
if (Deno.build.os === "mac") {
  filenamePrefix = "";
  filenameSuffix = ".dylib";
}

const filename = `./target/debug/${filenamePrefix}${filenameBase}${filenameSuffix}`;

const plugin = Deno.openPlugin(filename);

const { testSync, testAsync } = plugin.ops;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

// 执行 调用插件的 同步方法
const response = testSync.dispatch(
  textEncoder.encode('Hello! Sync control'),
  textEncoder.encode('Hello! Sync zeroCopy'),
) as Uint8Array;
console.log(`[Deno] testSync Response: ${textDecoder.decode(response)}`);


// 执行 调用插件的 异步方法
// 注册异步的回调操作
testAsync.setAsyncHandler(res => {
  console.log(`[Deno] testAsync Response: ${textDecoder.decode(res)}`);
});
// 触发异步方法事件
testAsync.dispatch(
  textEncoder.encode('Hello! Async control'),
  textEncoder.encode('Hello! Async zeroCopy'),
);