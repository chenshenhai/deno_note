#! /usr/bin/env deno --allow-run --allow-net test.ts
import { runTests } from "https://deno.land/x/testing/mod.ts";

import "./demo/buffer_reader/test_unit.ts";
import "./demo/request/test_unit.ts";
import "./demo/response/test_unit.ts";

runTests();
