import { assertEquals, equal } from "https://deno.land/std@v0.42.0/testing/asserts.ts";
import { add, addAsync } from "./mod.ts";

const { test, runTests } = Deno;

test(function example() {
  const result = add(1, 2);
  assertEquals(result, 3);
});

test(async function exampleAsync() {
  const result = await addAsync(1, 2);
  assertEquals(result, 3);
});

runTests();