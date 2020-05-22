const myObject = { fruit: "apple" };
console.log(myObject);

const myObjectProxy = new Proxy(myObject, {
  set: (obj, prop, value) => {
    console.log(obj, prop, value);
    return false;
  },
});
