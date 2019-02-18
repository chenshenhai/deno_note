/**
 * 中间件操作引擎
 * 处理洋葱模型中间件流程具体讲解可以看
 * https://github.com/chenshenhai/koajs-design-note/blob/master/note/chapter01/05.md
 * 
 * @param middleware {AsyncFunction[]}
 */
export const compose = function (middleware: Function[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!');
  }

  return function(ctx: object, next?: Function) {
    let index = -1;

    return dispatch(0);

    function dispatch(i) {
      if (i < index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;

      let fn = middleware[i];

      if (i === middleware.length) {
        fn = next;
      }

      if (!fn) {
        return Promise.resolve();
      }

      try {
        return Promise.resolve(fn(ctx, () => {
          return dispatch(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}