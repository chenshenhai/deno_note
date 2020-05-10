
import { assertEquals, equal } from "https://deno.land/std@0.50.0/testing/asserts.ts";
import { compileTemplate } from "./mod.ts";

const test = Deno.test;

test('testCompileTemplate', function() {
  const tpl = `
  <div>
  #if( datalist && datalist.length > 0 )
    <ul>
    #foreach(datalist).indexAs(i)
      <li>{{i}}:{{datalist[i]}}</li>
    #/foreach
    </ul>
  #elseif( showOthers === true )
    <p> others </p>
  #else
    <p> default </p>
  #/if

  #if( datajson)
    <ul>
    #foreach(datajson).keyAs(k)
      <li>{{k}}:{{datajson[k]}}</li>
    #/foreach
    </ul>
  #/if
  </div>`;
  const data = {
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
  const expectedResult = `  <div>      <ul>          <li>0:item1</li>          <li>1:item2</li>          <li>2:item3</li>        </ul>        <ul>          <li>key1:val1</li>          <li>key2:val2</li>        </ul>    </div>`;
  assertEquals(expectedResult, html);
});
