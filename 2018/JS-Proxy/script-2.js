const originalObject = { firstName: 'Arfat', lastName: 'Salman' };

const newHandler = {
  get(target, property, receiver) {
    console.log(`GET ${property}`);
  if (property in target) {
      return target[property];
    }
return 'Oops! This property does not exist.';
  }
};

const proxiedObject = new Proxy(originalObject, newHandler);
console.log(proxiedObject.secondeName);