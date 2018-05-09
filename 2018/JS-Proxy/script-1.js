const originalObject = { firstName: 'Arfat', lastName: 'Salman' };

const handler = {
  get(target, property, receiver) {
    console.log(`GET ${property}`);
    return target[property];
  }
  
};

const proxiedObject = new Proxy(originalObject, handler);
console.log(proxiedObject.firstName);