const onChange = (objToWatch, onChangeFunction) => { 
  const handler = {
    get(target, property, receiver) {
      onChangeFunction();
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value) {
      onChangeFunction();
      return Reflect.set(target, property, value);
    },
    deleteProperty(target, property) {
      onChangeFunction();
      return Reflect.deleteProperty(target, property);
    }
  };
return new Proxy(objToWatch, handler);
};

const logger = () => console.log('I was called');
const obj = { a: 'a' };
const proxy = onChange(obj, logger);
console.log(proxy.a); // logger called here in get trap
proxy.b = 'b'; // logger called here as well in set trap
delete proxy.a; // logger called here in deleteProperty trap