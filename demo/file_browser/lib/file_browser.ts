import {readDirSync, readFileSync} from 'deno';
import { Context, Req, Res } from "./../../framework/index.ts";

function renderDir(req: Res, res: Res) {
  // TODO
  return "TODO";
}

function renderFile(req: Res, res: Res) {
  // TODO
  return "TODO";
}

function fileBrowser(baseDir: string): Function {
  return async function(ctx: Context) {
    const {req, res} = ctx;
    const headers = req.getHeader() || {};
    const { pathname } = headers;
    // const stat = readDirSync(baseDir);
    res.setBody(`${baseDir}${pathname}`);
  };
}

export default fileBrowser;
