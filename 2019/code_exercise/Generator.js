// fibonacci Implement Using Generator
function *fibonacci() {
  let [prev, cur] = [0, 1];
  for (;;) {
    yield cur;
    [prev, cur] = [cur, prev + cur];
  }
}

for (let n of fibonacci()) {
  if (n > 100) break;
  console.log(n)
}

/* -------------------------- 
通过 Generator 函数objectEntries为它加上遍历器接口，就可以用for...of遍历了。
*/


function *objectEntries(obj) {
  let propKeys = Reflect.ownKeys(obj);
  console.log(propKeys)
  for (let key of propKeys) {
    yield [key, obj[key]];
  }
}

let jane = {
  name: 'jane',
  age: 20,
}

for (let [key, value] of objectEntries(jane)) {
  console.log(`${key}  ${value}`)
}


