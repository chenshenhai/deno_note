async function main() {
  const res = await fetch("https://cnodejs.org/api/v1/topic/5433d5e4e737cbe96dcef312");
  const json = await res.json();

  console.log("Fetch result: \r\n");
  console.log(JSON.stringify(json));
}
main();
