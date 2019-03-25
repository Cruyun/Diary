flatten = (arr) => {
  var newArr = [];
  function flat(ar) {
    ar.map(i => {
      if (Array.isArray(i) ) {
        flat(i)
      } else {
        newArr.push(i);
      }
    })
  }
  flat(arr)
  return newArr
}

function flatten2(arr){
  return arr.reduce(function (pre, cur) {
    return pre.concat(Array.isArray(cur) ? flatten2(cur) : cur)
  }, [])
}

console.log(flatten2([[1,2,3], [2,3]]))