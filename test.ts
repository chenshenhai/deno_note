// !/usr/bin/env deno --allow-all test.ts

import { runTests } from "https://deno.land/x/testing/mod.ts";
import "./demo/buffer_reader/test_unit.ts";
import "./demo/request/test_unit.ts";

runTests();

