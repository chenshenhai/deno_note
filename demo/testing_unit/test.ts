#!/usr/bin/env deno test --allow-all test.ts

import { assertEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts";
import { add, addAsync } from "./mod.ts";

const { test } = Deno;

test('example', function() {
  const result = add(1, 2);
  assertEquals(result, 3);
});

test('exampleAsync', async function() {
  const result = await addAsync(1, 2);
  assertEquals(result, 3);
});
