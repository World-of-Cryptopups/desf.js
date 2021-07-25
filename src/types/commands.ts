import { Message } from "discord.js";

export interface ICommandProps extends IOptionCommandProps {
  name: string;
  execute: (message: Message, args: string[]) => void;
}

export type IOptionCommandProps = {
  description?: string;
  alias?: string[];
  cooldown?: number;
  args?: boolean;
  usage?: string;
  guildOnly?: boolean;
};

export type ImportCommandProps = {
  command: ICommandProps;
};
