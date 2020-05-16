import compose from "https://dev.jspm.io/koa-compose";

let middleware = [];
let context = {
  data: []
};

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 001');
  ctx.data.push(2);
  await next();
  console.log('action 006');
  ctx.data.push(5);
});

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 002');
  ctx.data.push(2);
  await next();
  console.log('action 005');
  ctx.data.push(5);
});

middleware.push(async(ctx: any, next: Function) => {
  console.log('action 003');
  ctx.data.push(2);
  await next();
  console.log('action 004');
  ctx.data.push(5);
});

const fn = compose(middleware);

fn(context)
  .then(() => {
    console.log('end');
    console.log('context = ', context);
  });