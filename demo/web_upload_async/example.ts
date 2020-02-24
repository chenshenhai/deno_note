import { Application, Context } from "./../web/mod.ts";
import { parseContentType, parseMultipartForm } from "./../web_upload/bodyparser.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

async function getPage(path: string): Promise<string> {
  const pageStram = await Deno.readFileSync(path);
  const page = new TextDecoder().decode(pageStram);
  return page;
}

app.use(async function(ctx: Context, next: Function) {
  const general = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const bodyStream = await ctx.req.getBodyStream();

  const contentType = headers.get('Content-Type') || '';
  let body: string = ``;
  if (general.method === 'POST' && general.pathname === "/upload") {
    const formType = parseContentType(contentType);
    const formData = await parseMultipartForm(formType.boundary, bodyStream);
    if (formData[0].value instanceof Uint8Array && formData[0].value.length > 0) {
      Deno.writeFileSync(`./assets/${formData[0].filename}`, formData[0].value)
    }
    body = JSON.stringify(formData);;
  } else {
    body = await getPage("./index.html");
  }
  ctx.res.setStatus(200);
  ctx.res.setHeader('Content-Type', 'text/html');
  ctx.res.setBody(body);
  await next();
});

app.listen(opts, function() {
  console.log("the web is starting")
});