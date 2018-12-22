function increase(num): object {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if( !(num >= 0) ) {
        reject(new Error("The parameters must be greater than zero"));
      } else {
        resolve(num + 1);
      }

    }, 500);
  }).catch(err => console.log(err));
  
}

async function run() {
  const num = 0;
  const result1 = await increase(num);
  console.log(`result1 = ${result1}`);
  
  const result2 = await increase(result1);
  console.log(`result2 = ${result2}`);
  
  const result3 = await increase(result2);
  console.log(`result3 = ${result3}`);
}

run();