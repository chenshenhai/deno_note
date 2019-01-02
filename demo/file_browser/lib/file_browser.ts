import {readDirSync, readFileSync} from 'deno';

function renderDir() {
  // TODO
}

function renderFile() {
  // TODO
}

function fileBrowser(baseDir: string): Function {
  return async function(ctx) {
    const {req, res} = ctx;
    const stat = readDirSync(baseDir);
    res.setBody(`${JSON.stringify(stat)}`);
  };
}

export default fileBrowser;
