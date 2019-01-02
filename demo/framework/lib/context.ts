import { Req } from "./request.ts";
import { Res } from "./response.ts";

export interface Context {
  req: Req;
  res: Res;
}