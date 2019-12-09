import { BufferReader } from "./../buffer_reader/mod.ts";

export async function bodyParser(boundary: string, bodyBuffer) {
  return {
    boundary,
  }
}



export interface FormContentType {
  enctype: string;
  boundary: string;
}

/**
 * example: "multipart/form-data; boundary=----WebKitFormBoundaryk7fXm5rwGcU1OJIq"
 * return { enctype: "multipart/form-data", boundary: "----WebKitFormBoundaryk7fXm5rwGcU1OJIq" }
 * 
 * @param {string} contentType 
 * @return {FormContentType}
 */
export function parseContentType(contentType: string): FormContentType {
  const dataList: string[] = contentType.split("; ");
  const enctype = dataList[0];
  let boundary: string = '';
  if (typeof dataList[1] === "string") {
    const strList = dataList[1].split("=");
    if (strList[0] === "boundary") {
      boundary = strList[1];
    }
  }
  return {
    enctype,
    boundary,
  }
}

export function isMultipartFormData() {

}