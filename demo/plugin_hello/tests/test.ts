const filenameBase = "libplugin_hello";

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

const filename = `../target/debug/${filenamePrefix}${filenameBase}${filenameSuffix}`;

const plugin = Deno.openPlugin(filename);

const { testSync, testAsync } = plugin.ops;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

const response = testSync.dispatch(
  textEncoder.encode('test'),
  textEncoder.encode('test'),
);
console.log(`Plugin Sync Response: ${textDecoder.decode(response)}`);


testAsync.setAsyncHandler(res => {
  console.log(`Plugin Async Response: ${textDecoder.decode(res)}`);
});
testAsync.dispatch(
  textEncoder.encode('test'),
  textEncoder.encode('test'),
);

