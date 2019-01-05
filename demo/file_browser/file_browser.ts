import {readDirSync, readFileSync, lstatSync } from 'deno';
import { Context, Req, Res } from "./../framework/index.ts";

const decoder = new TextDecoder();

function renderDir( fullDirPath, baseDir ) {
  const fileInfo = readDirSync(fullDirPath);
  const list = [];
  let result = "404 Not Found!'";
  if (fileInfo && fileInfo.length > 0) {
    fileInfo.forEach(function(info) {
      const {path, name} = info;
      if (path && name) {
        const link = path.replace(baseDir, "");
        list.push(`<li><a href="${link}">${name}</a></li>`);
      }
    });
    result = `
    <head></head>
    <body>
      <ul>
        ${list.join("")}
      </ul>
    </body>`;
  }
  return result;
}

function renderFile( fullFilePath, baseDir ) {
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
        result = renderDir(fullPath, baseDir);
      } else if (stat.isFile() === true) {
        result = renderFile(fullPath, baseDir);
      }
    } catch (err) {
      // TODO
    }
    res.setBody(`${result}`);
  };
}

export default fileBrowser;
