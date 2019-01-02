import { Server } from "./index";

const app = new Server();
const addr = "127.0.0.1:3001";

// app.use(async function(ctx) {
//   const {req, res} = ctx;
//   const { pathname } = req;
//   if (pathname === "/" || pathname === "") {
//     res.body = "<h1>hello world</h1>";
//     res.end();
//   }
// });

app.use(async function(ctx) {
  const {req, res} = ctx;
  const headerData = req.getHeader();
  res.body = `${JSON.stringify(headerData)}`;
});

app.listen(addr, function(){
  console.log(`listening on ${addr}`);
});