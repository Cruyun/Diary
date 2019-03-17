/*
fib2 - Like the fib function you implemented above, able to handle numbers up to 50 (hint: look up memoization).
*/
let fib2 = memorize(n => {
  switch(n) {
    case 0: return 0;
    case 1: return 1;
    default: return fib2(n - 1) + fib2(n - 2);
  }
})

function memorize(fn) {
  let cache = new Map;
  return _ => {
    if (!cache.has(_)) {
      cache.set(_, fn(_))
    }
    return cache.get(_);
  }
}
console.log(fib2(50))

/*
isBalanced2 - Like the isBalanced function you implemented above, but supports 3 types of braces: curly {}, square [], and round (). A string with interleaving braces should return false.
*/

const isBalanced2 = (str) => {
  let stack = [];
  let arr = str.split('');
  let pairs = {
    '{': '}',
    '[': ']',
    '(': ')'
  }
  for (let i of arr) {
    if (i == '{' || i == '(' || i == '[') {
      stack.push(i);
    } else if (i == '}' || i == ')' || i == ']') {
      if (stack.length !== 0) {
        let tail = stack.pop();
        if (pairs[tail] !== i) {
          return false
        }
      }
    }
  }
  return stack.length === 0
}

console.log(isBalanced2('(foo { bar (baz) [boo] })'))

/*
uniq - Takes an array of numbers, and returns the unique numbers.
*/

const uniq = (arr) => {
  let seen = {};
  return arr.reduce((result, current) => {
    if (current in seen) {
      return result;
    }
    seen[current] = true;
    return result.concat(current)
  }, [])
}
console.log(uniq([1, 4, 2, 2, 3, 4, 8]))

