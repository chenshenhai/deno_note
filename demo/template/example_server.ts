import {readFileSync, listen, cwd} from 'deno';
import { compileTemplate } from "./mod.ts";

import { Response, ResponseWriter } from "./../response/mod.ts";
import { Request, RequestReader } from "./../request/mod.ts";

const baseDir = [cwd()].join("/");


async function startServer() {
  const addr = "127.0.0.1:3001";
  const listener = listen("tcp", addr);
  console.log(`listening on ${addr} \r\n`,);
  while (true) {
    const conn = await listener.accept();
    const req: Request = new RequestReader(conn);
    const res: Response = new ResponseWriter(conn);
    const gen = await req.getGeneral();
    const fullPath = `${baseDir}${gen.pathname}`;
    const bodyStr: string = readView(fullPath);
    res.setBody(bodyStr);
    res.setStatus(200);
    res.end();
  }
}


function readView(path: string): string {
  const decoder = new TextDecoder("utf-8");
  let html = `404 Not Found: ${path}`;
  try {
    const bytes = readFileSync(path);
    const tpl = decoder.decode(bytes);
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
    html = compileTemplate(tpl, data);
  } catch (err) {
    // console.log(err);
  }
  return html;
}


startServer();
