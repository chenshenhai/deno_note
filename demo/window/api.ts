const apiList = Object.keys(window)

// apiList.forEach(function(api) {
//   console.log(`${api}`);
// })

console.log(`Supported global API [count: ${apiList.length}]: \r\n`);
console.log(`${apiList.join(', ')} \r\n`);