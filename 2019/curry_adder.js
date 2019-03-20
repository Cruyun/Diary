// 科里化求和函数
/*
var adder = function () {
    var _args = [];
    return function () {
        if (arguments.length === 0) {
            return _args.reduce(function (a, b) {
                return a + b;
            });
        }
        [].push.apply(_args, [].slice.call(arguments));
        return arguments.callee; // *callee*是arguments对象的一个属性。它可以用于引用该函数的函数体内当前正在执行的函数
    }
};    
var sum = adder();

console.log(sum);     // Function

sum(100,200)(300);    // 调用形式灵活，一次调用可输入一个或者多个参数，并且支持链式调用
sum(400);
console.log(sum());   // 

*/
// 上面 adder是柯里化了的函数，它返回一个新的函数，新的函数接收可分批次接受新的参数，延迟到最后一次计算。

function adder() {
    var _args = []
    return function() {
        if (arguments.length == 0) {
            return _args.reduce(function(a, b) {
                return a + b
            })
        }
        [].push.apply(_args, [].slice.call(arguments));
        console.log(_args)
        return arguments.callee
    }
}
var sum = adder();
console.log(sum(100, 100, 100)(200)())