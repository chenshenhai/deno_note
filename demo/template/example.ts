import {readFileSync} from 'deno';
import { Server } from "./../framework/index.ts";
import { compileTemplate } from "./index.ts";

const app = new Server();
const addr = "127.0.0.1:3001";

function readView(path: string): string {
  const decoder = new TextDecoder("utf-8");
  const bytes = readFileSync(path);
  const text = decoder.decode(bytes);
  return text;
}

app.use(async function(ctx) {
  const { res } = ctx;
  const tpl = readView("./view/index.html");
  const data =  {
    title: "helloworld",
    text: "hellopage",
    isShowDataList: true,
    datalist: [
      "item1", "item2", "item3"
    ],
    datajson: {
      "key1": "val1",
      "key2": "val2"
    }
  };
  const html = compileTemplate(tpl, data);
  res.setBody(html);
});

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});