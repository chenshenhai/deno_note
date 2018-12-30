const encoder = new TextEncoder();
const CRLF = "\r\n";

interface Response {
  headers: string[];
  body: string;
}

function setRes (res: Response): Uint8Array {
  const {headers, body} = res;
  let resHeaders = [
    "HTTP/1.1 ",
    `Content-Length: ${body.length}`,
    `${CRLF}`
  ];
  if (headers && headers.length > 0) {
    resHeaders = headers;
  }
  const ctx = encoder.encode(resHeaders.join(CRLF));
  const ctxBody = encoder.encode(body);
  const data = new Uint8Array(ctx.length + (ctxBody ? ctxBody.length : 0));
  data.set(ctx, 0);
  if (ctxBody) {
    data.set(ctxBody, ctx.length);
  }
  return data;
}

export const createResponse = setRes;