import { env, platform } from "deno";

async function install() {
  const envInfo = env();
  const { HOME } = env();
  const cliBaseDir = `${HOME}/.deno_note`;
  const cliBinDir = `${cliBaseDir}/bin`;
  const cliBinSrc = `${cliBaseDir}/src`;
  // console.log('envInfo ==', envInfo)
  console.log('platform = ', platform)
}

install();