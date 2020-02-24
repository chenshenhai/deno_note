import { BufferReader } from "./../buffer_reader/mod.ts";

const CRLF_LEN = 2;
const decoder = new TextDecoder();
const textFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?"$/i;
const fileFieldReg = /^Content-Disposition\:\sform\-data\;\sname\="([^\"]+)?";\sfilename="([^\"]+)?"$/i;
const fileTypeReg = /^Content-Type\:\s([^\;]+)?$/i;

// 表单数据类型
export interface FormFieldData {
  name: string; // 表单数据名称
  filename?: string; // 表单文件数据名称
  type?: string; // 表单数据类型
  value: Uint8Array|string; // 表单数据值 文本string类型， 文件Uint8Array类型
}


/**
 * 解析 multipart/form-data 类型表单所有数据
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData[]} 表单数据列表
 *  例如 [{ name: "myName", value: "helloworld" }, { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }]
 */
export async function parseMultipartForm(boundary: string, stream: Uint8Array): Promise<FormFieldData[]> {
  const fields = await parseMultipartStreamToFields(boundary, stream);
  const dataList: FormFieldData[] = [];
  for await (const data of parseMultipartFormField(fields)) {
    dataList.push(data);
  }
  return dataList;
}


/**
 * 解析 multipart/form-data 类型表单单个数据
 * 
 * @param {string} boundary 单个表单数据的分隔符
 * @param {Uint8Array} stream 单个表单数据流, 也就是表单HTTP请求体
 * @return {FormFieldData} 单个表单数据
 *  例如文本类型 { name: "myName", value: "helloworld" }
 *  例如文件二进制数据 { name: "myFile", value: [0,1,...], type: "image/jpeg", filename: "xxx.jpg" }
 */
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
          name: execRs![1],
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
          name: execRs![1],
          type: typeRs![1],
          filename: execRs![2],
          value: field.subarray(valueStart, valueEnd),
        }
        yield fieldData;
      }
      
    }
  }
  
}

// 表单二进制数据流单个数据偏移量
interface FieldChunkOffset {
  start: number;
  end: number;
}


/**
 * 将 multipart/form-data 的表单类型按照表单的数据域
 * 切割成对应的数据缓存区/数据流
 * 
 * @param {string} boundary 表单数据的分隔符
 * @param {Uint8Array} stream 表单数据流, 也就是表单HTTP请求体
 * @return {Uint8Array[]} 返回表单每个数据的 内存区间/数据流
 */
async function parseMultipartStreamToFields(boundary: string, stream: Uint8Array): Promise<Uint8Array[]> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const newField = `--${boundary}`; // 表单数据分隔符/起始
  const end = `--${boundary}--`; // 表单终止符

  const newFieldChunk = encoder.encode(newField);
  const endChunk = encoder.encode(end);

  const bodyBuf = new Deno.Buffer(stream);
  const bufReader = new BufferReader(bodyBuf);
  let isFinish: boolean = false;

  const fieldChunkList: Uint8Array[] = [];
  const fieldOffsetList: FieldChunkOffset[] = [];
  let index: number = 0;

  // 根据分隔符和终止符
  // 来读取和计算表单内存空间/数据流里每个数据的起始和终止偏移量
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
          end: -1,
        });
      }
    }
    index = endIndex;
  }

  // 根据 表单内存空间/数据流里每个数据的起始和终止偏移量
  // 切割出每个数据的数据流
  fieldOffsetList.forEach((offset: FieldChunkOffset) => {
    if(offset) {
      if(offset.start >= 0 && offset.end >= 0) {
        const fieldChunk: Uint8Array = stream.subarray(offset.start, offset.end);
        fieldChunkList.push(fieldChunk);
      }
    }
  })

  return fieldChunkList;
}



export interface FormContentType {
  enctype: string;
  boundary: string;
}

/**
 * 解析 HTTP headers 里 Content-Type的表单类型
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
