import { Server } from "./lib/http";

const server = new Server();
const addr = "127.0.0.1:3001";

server.listen(addr);