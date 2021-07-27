import { Message } from "discord.js";

const DoNotDM = (message: Message, args: string[]) => {
  if (message.channel.type === "dm") {
    return false;
  }

  return true;
};

export { DoNotDM };
