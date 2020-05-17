import lodash from "https://dev.jspm.io/lodash";

const array = [1];
const result = lodash.concat(array, 2, [3], [[4]]);
console.log(result);
// export: [1, 2, 3, [4]]