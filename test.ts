#! /usr/bin/env deno run --allow-run --allow-net test.ts
import { test, runTests } from "https://deno.land/std/testing/mod.ts";

import "./demo/buffer_reader/test.ts";
import "./demo/request/test.ts";
import "./demo/response/test.ts";
import "./demo/server/test.ts";
import "./demo/template/test.ts";
import "./demo/web/test.ts";
import "./demo/web_router/test.ts";
import "./demo/web_static/test.ts";


runTests();

