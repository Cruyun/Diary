
function EventEmitter() {
  // constructor() {
    this.list = {}
  // }
  
  this.on = function(eventName, func){
    const cbs = this.list[eventName] || []
    cbs.push(func)
    this.list[eventName] = cbs
  }
  this.emit = function(eventName, ...args){
    const isOn = eventName in this.list
    if (!isOn) return;
    
    this.list[eventName].forEach((fn) => {
      fn.call(null, ...args)
    })
  }
  this.off = function(eventName, func){
    if (!(eventName in this.list)) {
      return;
    }
    var cbs = this.list[eventName];
    var cb = cbs.indexOf(func)
    if (cb !== -1) {
      cbs.splice(cb, 1)
    }
    
  }
}
// */
// class EventEmitter {
//   constructor() {
//     this.list = {}
//   }

//   on = (eventName, func) => {
//     const cbs = this.list[eventName] || [];
//     cbs.push(func);
//     this.list[eventName] = cbs;
//   }

//   emit = (eventName, ...args) => {
//     let isOn = eventName in this.list;
//     if (!isOn) return;

//     this.list[eventName].forEach(fn => {
//       fn.call(null, ...args);
//     }) 
//   }

//   remove = (eventName, func) => {
//     if (!(eventName in this.list)) return;

//     const index = this.list[eventName].indexOf(func);
//     if (index !== -1) {
//       this.list[eventName].splice(index, 1);
//     }
//   }
// }
const emmitter = new EventEmitter();
const sayHi = (name) => console.log(name);
emmitter.on('hi', sayHi)
emmitter.emit('hi', 'bob');