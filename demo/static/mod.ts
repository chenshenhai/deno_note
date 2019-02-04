import {readFileSync, lstatSync } from 'deno';

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

function serve(baseDir: string, options?: ServeOptions): Function {
  return async function(ctx, next) {
    await next();
    const {req, res} = ctx;
    const gen = await req.getGeneral() || {};
    // const headers = await req.getHeaders() || {};
    const pathname = gen.pathname;
    if ( options && typeof options.prefix === "string" && pathname.indexOf(options.prefix) === 0 ) {
      const path = pathFilter(pathname, options);
      const fullPath = `${baseDir}${path}`;
      let result = `${path} is not found!`;
      try {
        const stat = lstatSync(fullPath);
        if (stat.isFile() === true) {
          result = renderFile(fullPath);
          res.setStatus(200);
        }
      } catch (err) {
        // throw new Error(err);
      }
      res.setBody(`${result}`);
    }
  };
}

export const staticServe = serve;
