import { Req } from "./mod.ts";
import { Res } from "./response.ts";

export interface Ctx {
  req: Req;
  res: Res;
  setData: Function;
  getData: Function;
  cleanData: Function;
  hasData: Function;
  deleteData: Function;
}

export class Context implements Ctx {
  public req: Req;
  public res: Res;
  private dataMap;
  
  constructor(req: Req, res: Res) {
    this.req = req;
    this.res = res;
    this.dataMap = {};
  }

  public setData(key: string, val: any) {
    if (!this.dataMap) {
      this.dataMap = {};
    }
    this.dataMap[key] = val;
  }

  public getData(key: string) {
    const dataMap = this.dataMap || {};
    const val = dataMap[key];
    return val;
  }

  public cleanData() {
    this.dataMap = {};
  }

  public hasData(key: string) {
    const dataMap = this.dataMap || {};
    return dataMap.hasOwnProperty(key);
  }

  public deleteData(key: string) {
    if (this.dataMap) {
      delete this.dataMap[key];
    }
  }
  
}
