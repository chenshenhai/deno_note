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