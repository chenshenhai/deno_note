function fileBrowser(baseDir: string): Function {
  return async function(ctx) {
    const {req, res} = ctx;
    res.setBody(`${baseDir}`);
  };
}

export default fileBrowser;
