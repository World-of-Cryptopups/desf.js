import { Message } from "discord.js";

export type IMiddlewareFunctionProps = (
  message: Message,
  args: string[],
) => boolean;
