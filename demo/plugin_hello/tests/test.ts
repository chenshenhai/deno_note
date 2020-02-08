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
  textEncoder.encode('hello'),
  textEncoder.encode('world'),
);
console.log(`[Deno] testSync Response: ${textDecoder.decode(response)}`);

console.log('-------------------------------')

testAsync.setAsyncHandler(res => {
  console.log(`[Deno] testAsync Response: ${textDecoder.decode(res)}`);
});
testAsync.dispatch(
  textEncoder.encode('test'),
  textEncoder.encode('test'),
);

