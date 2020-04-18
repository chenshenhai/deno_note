import { Context } from './../web/mod.ts';

const readFileSync = Deno.readFileSync;
const lstatSync = Deno.lstatSync

const decoder = new TextDecoder();

interface ServeOptions {
  prefix: string;
}

/**
 * 读取静态文件
 * @param {string} fullFilePath 文件的绝对路径
 * @return {string}
 */
function renderFile( fullFilePath: string) {
  const bytes = readFileSync(fullFilePath);
  const content = decoder.decode(bytes);
  return content;
}

/**
 * 过滤静态资源请求路径
 * @param {string} path HTTP请求路径
 * @param {object} opts HTTP请求路径需要操作的参数
 *  opts.prefix {string} 清除掉HTTP路径的前缀
 * @param {string} 返回过滤掉的HTTP路径
 */
function pathFilter(path: string, opts?: ServeOptions) {
  const prefix = (opts && opts.prefix) ? opts.prefix : "";
  let result = "";
  result = path.replace(prefix, "");
  // 过滤掉路径里 ".." "//" 字符串，防止越级访问文件夹
  result = result.replace(/[\.]{2,}/ig, "").replace(/[\/]{2,}/ig, "/");
  return result;
}

/**
 * 静态服务中间件生成函数
 * @param baseDir 静态资源目录文件路径
 * @param options 静态资源配置参数
 *  opts.prefix {string} 清除掉HTTP路径的前缀
 * @param {function} 中间件函数
 */
function serve(baseDir: string, options?: ServeOptions): Function {
  return async function(ctx: Context, next: Function) {
    await next();
    const {req, res} = ctx;
    const gen = await req.getGeneral();
    const pathname = gen.pathname;
    if ( options && typeof options.prefix === "string" && pathname.indexOf(options.prefix) === 0 ) {
      const path = pathFilter(pathname, options);
      const fullPath = `${baseDir}${path}`;
      let result = `${path} is not found!`;
      try {
        const stat = lstatSync(fullPath);
        // 判断是否为文件路径
        if (stat.isFile === true) {
          result = renderFile(fullPath);
          res.setStatus(200);
        }
      } catch (err) {
        // throw new Error(err);
      }
      res.setBody(`${result}`);
      res.setFinish();
    }
  };
}

export const staticServe = serve;
