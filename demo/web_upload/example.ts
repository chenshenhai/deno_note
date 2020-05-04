import { Application, Context } from "./../web/mod.ts";
import { parseContentType, parseMultipartForm } from "./bodyparser.ts";

const app = new Application();
const opts: Deno.ListenOptions = {
  hostname: "127.0.0.1",
  port: 3001
}

app.use(async function(ctx: Context, next: Function) {
  const general = await ctx.req.getGeneral();
  const headers = await ctx.req.getHeaders();
  const bodyStream = await ctx.req.getBodyStream();

  const contentType = headers.get('Content-Type');
  let body: string = ``;
  if (general.method === 'POST') {
    const formType = parseContentType(contentType || '');
    const formData = await parseMultipartForm(formType.boundary, bodyStream);
    if (formData[1].value instanceof Uint8Array && formData[1].value.length > 0) {
      Deno.writeFileSync(`./assets/${formData[1].filename}`, formData[1].value)
    }
    body = JSON.stringify(formData);;
  } else {
    body = `
    <form method="POST" action="/" enctype="multipart/form-data">
      <p>data_text</p>
      <input name="data_text" value="abc1234567" /><br/>
      <p>data_image_file</p>
      <input name="image_file" type="file"  /><br/>
      <button type="submit">submit</button>
    </form>`;
  }
  ctx.res.setStatus(200);
  ctx.res.setHeader('Content-Type', 'text/html;charset=utf-8');
  ctx.res.setBody(body);
  await next();
});

app.listen(opts, function() {
  console.log("the web is starting")
});