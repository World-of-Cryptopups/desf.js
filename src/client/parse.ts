type AnyFunction = (...args: any[]) => void;

// run the custom function
const runParser = (f?: AnyFunction): string | boolean | undefined => {
  if (!f) return;

  try {
    f();
  } catch (e) {
    return e;
  }

  return true;
};



const isValueTrue = (data: any) => {
  return data === true;
}



export { runParser, isValueTrue };
