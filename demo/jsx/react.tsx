/// <reference path="https://deno.land/x/types/react/v16.13.1/react.d.ts" />
import React from "https://dev.jspm.io/react";
import ReactDOMServer from "https://dev.jspm.io/react-dom/server";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const View = () => {
  return (
    <div className="deno">land</div>
  )
}

const html = ReactDOMServer.renderToString(View())
console.log(html)