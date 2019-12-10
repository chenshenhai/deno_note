import { BufferReader } from "./../buffer_reader/mod.ts";

const CRLF_LEN = 2;
const decoder = new TextDecoder();

interface FieldChunkOffset {
  start?: number;
  end?: number;
}

const textFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?"$/i;
const fileFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?";\sfilename="([^\"]+)?"$/i;
const fileTypeReg = /^Content-Type\:\s([^\;]+)?$/i;

export interface FormFieldData {
  name: string;
  filename?: string;
  type?: string;
  value: Uint8Array|string;
}

async function* parseMultipartFormField(fields: Uint8Array[]): AsyncGenerator<FormFieldData> {
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const reader = new BufferReader(new Deno.Buffer(field));
    const contentDescChunk = await reader.readLineChunk();
    const contentDesc = decoder.decode(contentDescChunk);

    if (textFieldReg.test(contentDesc)) {
      const execRs = textFieldReg.exec(contentDesc);
      const nullLine = await reader.readLine();
      const value: string = await reader.readLine();
      if (nullLine === '') {
        const fieldData = {
          name: execRs[1],
          value,
        }
        yield fieldData
      }
    } else if (fileFieldReg.test(contentDesc)) {
      const execRs = fileFieldReg.exec(contentDesc);

      const contentTypeChunk = await reader.readLineChunk();
      const contentType = decoder.decode(contentTypeChunk);
      const typeRs = fileTypeReg.exec(contentType);

      const nullLine = await reader.readLine();
      if (nullLine === '') {
        const valueStart = (contentDescChunk.length + CRLF_LEN) + (contentTypeChunk.length + CRLF_LEN) + CRLF_LEN;
        const valueEnd = field.length - CRLF_LEN;
        const fieldData = {
          name: execRs[1],
          type: typeRs[1],
          filename: execRs[2],
          value: field.subarray(valueStart, valueEnd),
        }
        yield fieldData;
      }
      
    }
  }
  
}

export async function parseMultipartForm(boundary: string, stream: Uint8Array): Promise<FormFieldData[]> {
  const fields = await parseMultipartStreamToFields(boundary, stream);
  const dataList: FormFieldData[] = [];
  for await (const data of parseMultipartFormField(fields)) {
    dataList.push(data);
  }
  return dataList;
}

async function parseMultipartStreamToFields(boundary: string, stream: Uint8Array): Promise<Uint8Array[]> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const newField = `--${boundary}`;
  const end = `--${boundary}--`;

  const newFieldChunk = encoder.encode(newField);
  const endChunk = encoder.encode(end);

  const bodyBuf = new Deno.Buffer(stream);
  const bufReader = new BufferReader(bodyBuf);
  let isFinish: boolean = false;

  const fieldChunkList: Uint8Array[] = [];
  const fieldOffsetList: FieldChunkOffset[] = [];
  let index: number = 0;

  while(!isFinish) {
    const lineChunk = await bufReader.readLineChunk();
    const lineChunkLen = lineChunk.length + CRLF_LEN;
    const startIndex = index;
    const endIndex = index + lineChunkLen;

    if (lineChunk.length === endChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === end) {
        isFinish = true;
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = endIndex - lineChunkLen;
        }
        break;
      }
    }

    if (lineChunk.length === newFieldChunk.length) {
      const line: string = decoder.decode(lineChunk);
      if (line === newField) {
        if (fieldOffsetList[fieldOffsetList.length - 1]) {
          fieldOffsetList[fieldOffsetList.length - 1].end = startIndex;
        }
        fieldOffsetList.push({
          start: startIndex + lineChunkLen,
        });
      }
    }
    index = endIndex;
  }

  fieldOffsetList.forEach((offset: FieldChunkOffset) => {
    if(offset && offset.start >= 0 && offset.end >= 0) {
      const fieldChunk: Uint8Array = stream.subarray(offset.start, offset.end);
      fieldChunkList.push(fieldChunk);
    }
  })

  return fieldChunkList;
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
