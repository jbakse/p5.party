/* eslint-disable */

function delay(ms) {
  return new Promise((r) => {
    setTimeout(r, ms);
  });
}

// demo the outdated shorcut problem

const test = {
  animals: {
    bird: {
      legs: 2,
    },
    cat: {
      legs: 4,
    },
  },
};

console.log("test", test);

const watchedTest = onChange(test, (path, newValue, oldValue) =>
  console.log(path, newValue, oldValue)
);

console.log("wt", watchedTest);

const watchedCat = watchedTest.animals.cat;

watchedCat.teeth = "3";

delete test.animals.cat;

console.log("t", test);

watchedCat.teeth = "5";

console.log(JSON.stringify(test));
