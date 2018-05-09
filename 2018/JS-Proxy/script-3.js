const onChange = (objToWatch, onChangeFunction) => { 
  const handler = {
    get(target, property, receiver) {
      onChangeFunction(); // Calling our function
      return target[property];
    }
  };
return new Proxy(objToWatch, handler);
};

const logger = () => console.log("I was called");
const obj = {a : 'aaa'};
const proxyObj = onChange(obj, logger);
proxyObj.a;