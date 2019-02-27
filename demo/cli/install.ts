
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readSrcFile(filePath: string): string {
  const buf = Deno.readFileSync(filePath);
  const context = decoder.decode(buf);
  return context;
}

async function install() {
  const { HOME } = Deno.env();
  const cliBaseDir = `${HOME}/.deno_cli`;
  const cliBinDir = `${cliBaseDir}/bin`;
  const cliSrcDir = `${cliBaseDir}/src`;
  // console.log('envInfo ==', envInfo);

  try {
    Deno.removeSync(cliBaseDir, {recursive: true});
  } catch (err) {
    console.log(err);
  }
  Deno.mkdirSync(cliBaseDir);
  Deno.mkdirSync(cliBinDir);
  Deno.mkdirSync(cliSrcDir);
  
  const cliSource = readSrcFile('./src/denocli.ts');
  const srcFilePath = `${cliSrcDir}/deno_cli.ts`;
  Deno.writeFileSync(srcFilePath, encoder.encode(cliSource));

  const binFilePath = `${cliBinDir}/denocli`;
  const cliBinContext = `deno ${srcFilePath}`;
  Deno.writeFileSync(binFilePath, encoder.encode(cliBinContext));
  const execAuth = Deno.run({args: ["chmod", "+x", binFilePath]});
  await execAuth.status();
  execAuth.close();

  console.log("\r\n[INFO]: denocli is installed successfully!\r\n");
  console.log(`
    export PATH=$PATH:${HOME}/.deno_cli/bin  >> ~/.bash_profile\r\n
    source  ~/.bash_profile\r\n
  `)
}

install();