const MIME = {
  "css": "text/css",
  "less": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};

export const getMIME = function(pathname: string): string {
  const suffixReg = /\.([a-z]{1,})$/i;
  const execResult = suffixReg.exec(pathname);
  let suffix = "html";
  let result = MIME[suffix];
  if (execResult && execResult.length > 0 && typeof execResult[1] === "string") {
    suffix = execResult[1];
  }
  result = MIME[suffix] || MIME["html"];
  return result;
};