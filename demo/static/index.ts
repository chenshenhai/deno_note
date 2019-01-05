import {readFileSync, lstatSync } from 'deno';
import { Context, Req, Res } from "./../framework/index.ts";

const decoder = new TextDecoder();

interface ServeOptions {
  prefix: string;
}

function renderFile( fullFilePath: string) {
  const bytes = readFileSync(fullFilePath);
  const content = decoder.decode(bytes);
  return content;
}

function pathFilter(path: string, opts?: ServeOptions) {
  const prefix = (opts && opts.prefix) ? opts.prefix : "";
  let result = "";
  result = path.replace(prefix, "");
  result = result.replace(/[\.]{2,}/ig, "").replace(/[\/]{2,}/ig, "/");
  return result;
}

function staticServe(baseDir: string, options?: ServeOptions): Function {
  return async function(ctx: Context) {
    const {req, res} = ctx;
    const headers = req.getHeader() || {};
    const { pathname } = headers;
    const path = pathFilter(pathname, options);
    const fullPath = `${baseDir}${path}`;
    let result = "Sources is not found!";
    try {
      const stat = lstatSync(fullPath);
      if (stat.isFile() === true) {
        result = renderFile(fullPath);
      }
    } catch (err) {
      // TODO
    }
    res.setBody(`${result}`);
  };
}

export default staticServe;
