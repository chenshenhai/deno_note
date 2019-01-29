import { Conn } from "deno";

export interface Response {
  setHeaders(key: string, val: string): boolean;
  setBody(body: string): boolean;
  getBody(): string;
  end(): boolean;
}

export class ResponseWriter extends Response {
  private _conn: Conn;
  private _body: string = "";
  private _headers: Headers;
}