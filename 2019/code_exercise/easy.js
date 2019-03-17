/*
fib - Returns the nth Fibonacci number.
*/
function fab(num) {
  var arr = [];
  arr.push.apply(arr, [0, 1])

  for (let i = 2; i <= num; i++) {
    arr[i] = arr[i - 1] + arr[i - 2];
  }
  return arr[num];
}
console.log(fab(20))

function fabCur(num) {
  if (num <= 1) {
    return num;
  }
  return fabCur(num - 1) + fabCur(num - 2);
}
console.log(fabCur(20))

/*
factorial - Returns a number that is the factorial of the given number.
*/
function factorial(num) {
  if (num <= 1) {
    return num;
  }
  return factorial(num - 1) * num;
}
console.log(factorial(6))

// isPrime - Returns true or false, indicating whether the given number is prime.
function isPrime(num) {
  let b = Math.floor(Math.sqrt(num));
  for (let i = b; i > 1; i--) {
    if (num % i == 0) {
      return false
    }
  }
  return true
}
console.log(isPrime(17))

// isSorted - Returns true or false, indicating whether the given array of numbers is sorted.

function isSorted(arr, index){
  if (index == 1) {
    return true
  }
  return arr[index - 1] <= arr[index - 2] ? false :isSorted(arr, index - 1)
}

console.log(isSorted([0, 2, 3], 2))

/*
filter - Implement the filter function.

```
filter([1, 2, 3, 4], n => n < 3)    // [1, 2]
```
*/

const filter = (arr, func) =>  {
  let res = [];
  for (let i of arr) {
    if (func(i)) res.push(i)
  }
  return res
};

console.log(filter([1, 2, 3, 4], n => n < 3))

const reduce = (arr, func, initValue) => {
  for (let i in arr) {
    initValue = func(initValue, arr[i], i, arr)
  }
  return initValue
}

console.log(reduce([1, 2, 3, 4], (a, b) => a + b, 0))

const indexOf = (arr, n) => {
  for (let i in arr) {
    if (arr[i] == n) {
      return i;
    }
  }
  return -1;
}

console.log(indexOf([1,2,3], 4))

const string2Int = (str) => {
  let nums = str.split('').map(s => +s);
  return nums.reduce((x, y) => x * 10 + y, 0)
}
console.log(string2Int('123'))

const reverse = (str) => {
  if (str.length <= 1) {
    return str;
  }
  let index = str.length - 1;
  let res = '';
  while (index > -1) {
    res += str[index];
    index--;
  }
  return res;
}

console.log(reverse('abcdfe'))

// isPalindrome - Return true or false indicating whether the given string is a plaindrone (case and space insensitive).
function isPalindrome(str, low, high, length) {
  let arr = str.split('').filter((e) => e != ' ')
  if (length <= 1) {
    return true;
  }
  if (arr[low] != arr[high]) {
    return false;
  } else {
    return isPalindrome(str, low + 1, high - 1, length - 2)
  }
}

console.log(isPalindrome('12345123456', 0, 10, 10))

/*
missing - Takes an unsorted array of unique numbers (ie. no repeats) from 1 through some number n,
 and returns the missing number in the sequence (there are either no missing numbers, 
  or exactly one missing number). Can you do it in O(N) time?
*/

const missing = (arr) => {
  let max = arr[0];
  let sum = 0;
  arr.forEach(i => {
    if (i > max) max = i;
    sum += i;
  })
  let expectedSum = (1 + max) * max / 2;
  let diff = expectedSum - sum;
  if (diff != 0) {
    return diff
  }
  return undefined;
}

console.log(missing([1, 2, 3, 4]))

const isBalanced = (str) => {
  let stack = [];
  let arr = str.split('');
  for (let i of str) {
    if (i == '{') {
      stack.push(i);
    } else if (i == '}') {
      if (stack.length !== 0) {
        let tail = stack.pop();
        if (tail !== '{') {
          return false;
        }
      }
    }
  }
  if (stack.length !== 0) {
    return false
  }
  return true
}

console.log(isBalanced('foo { bar { baz } boo }'))