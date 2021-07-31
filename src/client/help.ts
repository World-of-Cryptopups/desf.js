import { ICommandProps } from "../typings";

const generateCommandTitle = (prefix: string, c: ICommandProps) => {
  const help: string[] = [(prefix + c.name).trim()];

  if (c.args) {
    help.push("<args>...");
  }

  if (c.aliases && c.aliases.length > 0) {
    help.push(`[aliases: ${c.aliases.join(", ")}]`);
  }

  return help.join(" ").trim();
};

const generateCommandDesc = (c: ICommandProps) => {
  const help: string[] = [];

  if (c.cooldown) {
    help.push(`(cooldown: ${c.cooldown.seconds} seconds)\n`);
  }
  help.push(c.description || "");

  return help.join(" ").trim();
};

export { generateCommandTitle, generateCommandDesc };
