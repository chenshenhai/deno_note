// 获取 所有可枚举 属性/方法 名称
// const apiList = Object.keys(window)

// 获取 所有全局属性/方法 名称
const apiList = Object.getOwnPropertyNames(window)

console.log(`Supported global API [count: ${apiList.length}]: \r\n`);
console.log(`${apiList.join(',\r\n')}`);