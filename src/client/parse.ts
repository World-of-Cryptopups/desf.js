type AnyFunction = (...args: any[]) => void;

// run the custom function
const runParser = (f: AnyFunction | undefined, args: any[]) => {
  // even if undefined, return true still
  if (!f) return;

  try {
    f(...args);
  } catch (e) {
    // log error in running function
    console.error(e);
  }
};

const isValueTrue = (data: any) => {
  return data === true;
};

export { runParser, isValueTrue };
