import {readDirSync, readFileSync} from 'deno';
import { Context } from "./../../framework/index.ts";

function renderDir() {
  // TODO
}

function renderFile() {
  // TODO
}

function fileBrowser(baseDir: string): Function {
  return async function(ctx: Context) {
    const {req, res} = ctx;
    const stat = readDirSync(baseDir);
    res.setBody(`${JSON.stringify(stat)}`);
  };
}

export default fileBrowser;
