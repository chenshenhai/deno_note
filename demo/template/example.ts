import { compileTemplate } from "./mod.ts";

function readView(path: string): string {
  const decoder = new TextDecoder("utf-8");
  const bytes = Deno.readFileSync(path);
  const text = decoder.decode(bytes);
  return text;
}

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
console.log(html);