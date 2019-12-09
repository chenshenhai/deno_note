import { BufferReader } from "./../buffer_reader/mod.ts";

interface FieldsIndex {
  start: number;
  end: number;
}

export async function bodyParser(boundary: string, bodyStream: Uint8Array) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const newField = `--${boundary}`;
  const end = `--${boundary}--`;

  const newFieldChunk = encoder.encode(newField);
  const endChunk = encoder.encode(end);

  const bodyBuf = new Deno.Buffer(bodyStream);
  const bufReader = new BufferReader(bodyBuf);
  let isFinish: boolean = false;

  const fieldChunkList: Uint8Array[] = [];
  const fieldChunkOffset: number[] = [];
  let index: number = 0;
  const totalLength: number = bodyStream.length;

  while(!isFinish) {
    const lineChunk = await bufReader.readLineChunk();
    const startIndex = index;
    const endIndex = index + (lineChunk.length + 2);

    if (lineChunk.byteLength === endChunk.byteLength) {
      const line: string = decoder.decode(lineChunk);
      if (line === end) {
        isFinish = true;
        fieldChunkOffset.push(endIndex);
        break;
      }
    }

    if (lineChunk.byteLength === newFieldChunk.byteLength) {
      const line: string = decoder.decode(lineChunk);
      if (line === newField) {
        fieldChunkOffset.push(startIndex);
      }
    }
    
    index = endIndex;
  }

  return {
    totalLength,
    fieldChunkOffset,
    boundary,
    body: new TextDecoder().decode(bodyStream),
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