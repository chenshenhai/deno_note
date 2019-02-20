const encoder = new TextEncoder();

function main(): void {
  const data = encoder.encode("this is writing result!");
  Deno.writeFileSync("./assets/result.txt", data);
}

main();