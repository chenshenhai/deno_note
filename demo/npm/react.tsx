/// <reference path="https://deno.land/x/types/react/v16.13.1/react.d.ts" />
import React from "https://dev.jspm.io/react";
import ReactDOMServer from "https://dev.jspm.io/react-dom/server";


const Module = (data: string) => {
  return (
    <div className="mod">
      <div>data: {data}</div>
    </div>
  )
}

const View = () => {
  return (
    <div className="hello">
      {Module('hello world')}
    </div>
  )
}

const html = ReactDOMServer.renderToString(View())
console.log(html)