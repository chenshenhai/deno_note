import { Application } from "./../web/mod.ts";
import { parseContentType, parseMultipartForm, FormFieldData } from "./bodyparser.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx, next) {
  const general = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const contentType = headers.get('Content-Type');

  let body: string = `404: Not found`;
  if (general.method === "POST") {
    if (general.pathname === "/multipart") {
      const formType = parseContentType(contentType);
      const bodyStream: Uint8Array = await ctx.req.getBodyStream();
      const dataList: FormFieldData[] = await await parseMultipartForm(formType.boundary, bodyStream);
      body = JSON.stringify(dataList);
      ctx.res.setHeader('Content-Type', 'application/json');
      ctx.res.setStatus(200);
    }
  }

  ctx.res.setBody(body);
  await next();
});

app.listen(opts, function() {
  console.log(`listening on ${opts.hostname}:${opts.port}\r\n`);
});