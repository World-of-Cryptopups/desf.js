import { ICommandOptionalFunctionProps } from "../typings/commands";

// run the custom value error handler and parser
export const runParser = (
  f?: ICommandOptionalFunctionProps,
): string | boolean | undefined => {
  if (!f) return;

  try {
    f();
  } catch (e) {
    return e;
  }

  return true;
};
