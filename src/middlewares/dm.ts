import { Message } from "discord.js";

const DoNotDM = (message: Message) => {
  if (message.channel.type === "DM") {
    return false;
  }

  return true;
};

export { DoNotDM };
