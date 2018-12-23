/**
 *  Thanks to https://github.com/lenkan/deno-http/
 *  Copy from  https://github.com/lenkan/deno-http/
 */

import { Writer, Conn } from 'deno'
import { HttpResponseHeaders, HttpRequestHeaders } from './http-header';
const CRLF = '\r\n'
const encoder = new TextEncoder('utf-8')

export interface HttpResponse {
  /**
   * Gets the underlying connection instance.
   */
  connection: Conn

  /**
   * Adds the specified headers to the response. It will
   * be merged into any already added headers.
   */
  headers(headers: HttpResponseHeaders): HttpResponse

  /**
   * Sets the specified HTTP response status
   */
  status(status: number, reason?: string): HttpResponse

  /**
   * Sends the response with the specified body. Resolves when the body has been written.
   */
  send(body?: Uint8Array): Promise<void>
}

interface HttpResponseMessage {
  status: number
  protocol: string
  reason: string
  headers: HttpResponseHeaders
}


async function write(writer: Writer, message: HttpResponseMessage, body?: Uint8Array): Promise<void> {
  const lines = [
    `${message.protocol} ${message.status} ${message.reason}`,
    ...Object.keys(message.headers).map(name => {
      return `${name}: ${message.headers[name]}`
    }),
    `${CRLF}`
  ].join(CRLF)

  const envelope = encoder.encode(lines)

  const data = new Uint8Array(envelope.length + (body ? body.length : 0))

  data.set(envelope, 0)
  if (body) {
    data.set(body, envelope.length)
  }

  await writer.write(data)
}

function head(obj: HttpResponseHeaders) {
  return obj
}

const defaultHeaders : HttpResponseHeaders = Object.freeze(head({
  'Connection': 'keep-alive'
}))
  

export function response(connection: Conn, request: HttpRequestHeaders): HttpResponse {
  const message: HttpResponseMessage = {
    status: undefined,
    reason: undefined,
    headers: defaultHeaders,
    protocol: 'HTTP/1.1'
  }

  function finish() {
    const shouldClose = request.Connection === 'close' || message.headers.Connection === 'close'
    if(shouldClose) {
      connection.close()
    }
  }

  return {
    connection,
    headers(headers: HttpResponseHeaders): HttpResponse {
      message.headers = { ...message.headers, ...headers }
      return this
    },

    status(status: number, reason?: string): HttpResponse {
      message.status = status
      if (reason) {
        message.reason = reason
      }
      return this
    },

    async send(body?: Uint8Array) {
      await write(connection, message, body)
      finish()
    }
  }
}
