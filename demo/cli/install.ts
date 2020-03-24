// deno --allow-all install.ts

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function readSrcFile(filePath: string): string {
  const buf = Deno.readFileSync(filePath);
  const context = decoder.decode(buf);
  return context;
}

async function install() {
  const encoder = new TextEncoder();

  // 初始化 Linux 主目录下的cli工具文件夹
  const { HOME } = Deno.env();
  const cliBaseDir = `${HOME}/.deno_cli`;
  const cliBinDir = `${cliBaseDir}/bin`;
  const cliSrcDir = `${cliBaseDir}/src`;
  try {
    // 如果原来 有目录 .deno_cli/
    // 就删除掉
    Deno.removeSync(cliBaseDir, {recursive: true});
  } catch (err) {
    console.log(err);
  }
  // 在HOME目录下创建CLI工具隐藏目录 .deno_cli/
  Deno.mkdirSync(cliBaseDir);
  // 创建目录 $HOME/.deno_cli/bin 目录
  Deno.mkdirSync(cliBinDir);
  // 创建目录 $HOME/.deno_cli/src 目录
  Deno.mkdirSync(cliSrcDir);
  

  // 在源文件目录.deno_cli/src/下写入需要执行程序的源码文件
  const cliSource = readSrcFile('./src/denocli.ts');
  const srcFilePath = `${cliSrcDir}/deno_cli.ts`;
  Deno.writeFileSync(srcFilePath, encoder.encode(cliSource));

  // 在可执行文件目录.deno_cli/bin/ 下写入可执行文件的目录
  const binFilePath = `${cliBinDir}/denocli`;
  const cliBinContext = `deno run ${srcFilePath}`;
  Deno.writeFileSync(binFilePath, encoder.encode(cliBinContext));

  // 对可执行文件的目录.deno_cli/bin/进行chmod +x权限赋予操作
  const execAuth = Deno.run({cmd: ["chmod", "+x", binFilePath]});
  await execAuth.status();
  execAuth.close();

  console.log("\r\n[INFO]: denocli is installed successfully!\r\n");
  // 执行成功后提示全局变量设置
  console.log(`
    export PATH=$PATH:${HOME}/.deno_cli/bin  >> ~/.bash_profile\r\n
    source  ~/.bash_profile\r\n
  `)
}

install();