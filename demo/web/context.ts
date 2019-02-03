import { Conn } from "deno";
import { Request, RequestReader } from "./../request/mod.ts";
import { Response, ResponseWriter } from "./../response/mod.ts";

export class Context {
  public req: Request;
  public res: Response;

  private _dataMap = {};

  constructor(conn: Conn) {
    this.req = new RequestReader(conn);
    this.res = new ResponseWriter(conn);
  }

  public setData(key: string, val: any) {
    if (!this._dataMap) {
      this._dataMap = {};
    }
    this._dataMap[key] = val;
  }

  public getData(key: string) {
    const dataMap = this._dataMap || {};
    const val = dataMap[key];
    return val;
  }

  public cleanData() {
    this._dataMap = {};
  }

  public hasData(key: string) {
    const dataMap = this._dataMap || {};
    return dataMap.hasOwnProperty(key);
  }

  public deleteData(key: string) {
    if (this._dataMap) {
      delete this._dataMap[key];
    }
  }

}