import {readDirSync, readFileSync, lstatSync } from 'deno';
import { Context, Req, Res } from "./../../framework/index.ts";

const decoder = new TextDecoder();

function renderDir( fullDirPath ) {
  // TODO
  const fileInfo = readDirSync(fullDirPath);
  return JSON.stringify(fileInfo);
}

function renderFile( fullFilePath ) {
  // TODO
  const bytes = readFileSync(fullFilePath);
  const content = decoder.decode(bytes);
  return content;
}

function fileBrowser(baseDir: string): Function {
  return async function(ctx: Context) {
    const {req, res} = ctx;
    const headers = req.getHeader() || {};
    const { pathname } = headers;
    const fullPath = `${baseDir}${pathname}`;
    let result = "File or Directory is not found!";
    try {
      const stat = lstatSync(fullPath);
      if ( stat.isDirectory() === true) {
        result = renderDir(fullPath);
      } else if (stat.isFile() === true) {
        result = renderFile(fullPath);
      }
    } catch (err) {
      // TODO
    }
    res.setBody(`${result}`);
  };
}

export default fileBrowser;
