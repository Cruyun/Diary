function add(a, b) {
  const adder = (i, len, arr) => {
      return i < len ? parseInt(arr[i]) : 0;
  }
  const reverse = (num) => num.toString().split('').reverse();
  var arrA = reverse(a);
  var arrB = reverse(b);

  var carry = 0;
  var cur = 0;
  var res = [];
  var ALen = arrA.length;
  var BLen = arrB.length;

  var maxLen = Math.max(ALen, BLen);

  for (let i = 0; i < maxLen; i++) {
    cur = carry;
    cur = cur + adder(i, ALen, arrA) + adder(i, BLen, arrB);
    carry = Math.floor(cur / 10);
    cur %= 10;
    res.push(cur);
  }
  if (carry !== 0) {
    res.push(carry);
  }
  return res.reverse().join('');
}

console.log(add('2321312312312312999', '1000') )