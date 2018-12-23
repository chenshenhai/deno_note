/**
 *  Thanks to https://github.com/lenkan/deno-http/
 *  Copy from  https://github.com/lenkan/deno-http/
 */

import { Reader, BufferedReader } from './buffered-reader'
import { HttpRequestHeaders } from './http-header'
import { Conn } from 'deno';

export interface HttpRequest {
  /**
   * The HTTP method used for the request.
   */
  method: string

  /**
   * The protocol version used for the request.
   */
  protocol: string

  /**
   * The request path.
   */
  path: string

  /**
   * The request headers
   */
  headers: HttpRequestHeaders

  /**
   * Reads the entire body into a byte array and resolves with the result.
   */
  buffer(): Uint8Array

  /**
   * Reads and parses the entire body as a javascript object.
   */
  json(): any

  /**
   * Reads and decodes the entire body as plain text.
   */
  text(): string
}

async function readBody(reader: Reader, headers: HttpRequestHeaders) {
  const decoder = new TextDecoder('utf-8')
  const hasBody = headers['Content-Length']
  const length = parseInt(headers['Content-Length'] || '0', 10)
  const body = hasBody ? await reader.read(length) : new Uint8Array(0)

  function buffer(): Uint8Array {
    return body
  }

  function text(): string {
    return decoder.decode(body)
  }

  function json(): any {
    return hasBody ? JSON.parse(text()) : undefined
  }

  return {
    buffer,
    json,
    text
  }
}

function parseHeader(line: string) {
  const separator = line.indexOf(':')
  const name = line.slice(0, separator).trim()
  const value = line.slice(separator + 1, line.length).trim()
  return { name, value }
}

function mergeHeaders(headers: HttpRequestHeaders, header: { name: string, value: string }) {
  return { ...headers, [header.name]: header.value }
}


async function readLines(reader: Reader) {
  const lines: string[] = []
  while (true) {
    lines.push(await reader.readLine())
    if (lines[lines.length - 1] === '') {
      return lines.slice(0, lines.length - 1)
    }
  }
}

export async function* read(conn: Conn): AsyncIterableIterator<HttpRequest> {
  const reader = BufferedReader.from(conn, 4096)
  while (!reader.finished()) {
    const request: string = await reader.readLine()
    if (request === '') { // Try again until we get something or eof
      continue
    }

    const lines = await readLines(reader)
    const [method, path, protocol] = request.split(' ').map(s => s.trim())
    const headers = lines.map(parseHeader).reduce<HttpRequestHeaders>(mergeHeaders, {})
    const body = await readBody(reader, headers)

    if (headers['Connection'] === 'close') {
      reader.close()
    }

    yield {
      path: path,
      protocol: protocol,
      method: method,
      headers,
      buffer: body.buffer,
      json: body.json,
      text: body.text
    }
  }
}
