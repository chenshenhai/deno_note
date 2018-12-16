// module
import { hello } from "./lib/hello.ts";
import world from "./lib/world.ts";

const str1 = hello();
const str2 = world.world();
console.log(`${str1} ${str2}`);


