async function install() {
  const envInfo = Deno.env();
  const { HOME } = Deno.env();
  const cliBaseDir = `${HOME}/.deno_note`;
  const cliBinDir = `${cliBaseDir}/bin`;
  const cliBinSrc = `${cliBaseDir}/src`;
  // console.log('envInfo ==', envInfo)
  console.log('platform = ', Deno.platform)
}

install();