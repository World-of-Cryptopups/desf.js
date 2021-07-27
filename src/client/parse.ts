type AnyFunction = (...args: any[]) => void;

// run the custom function
export const runParser = (f?: AnyFunction): string | boolean | undefined => {
  if (!f) return;

  try {
    f();
  } catch (e) {
    return e;
  }

  return true;
};
