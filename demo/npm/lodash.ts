import lodash from "https://dev.jspm.io/lodash";

console.log('lodash =', lodash);

const array = [1];
const result = lodash.concat(array, 2, [3], [[4]]);
 
console.log(result);
// => [1, 2, 3, [4]]