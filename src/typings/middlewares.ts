import { Client, Message } from "discord.js";

export type IMiddlewareFunctionProps = (
  message: Message,
  args: string[],
  options?: {
    client?: Client;
  },
) => boolean;
