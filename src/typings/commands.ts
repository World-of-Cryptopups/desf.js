import { Client, Message } from "discord.js";

export type ICommandFunctionProps = (
  message: Message,
  args: string[],
  options: {
    client: Client;
  },
) => void;

export interface ICommandProps extends IOptionCommandProps {
  name: string;
  execute: ICommandFunctionProps;
}

export type IOptionCommandProps = {
  description?: string;
  aliases?: string[];
  cooldown?: IOptionCommandCooldownProps; // TODO: implement custom number of commands in that duration
  args?: {
    values?: IOptionCommandArgsValuesProps;
    error?: IOptionCommandArgsErrorProps;
  };
  guildOnly?: IOptionCommandGuildOnlyProps;
};
export type IOptionCommandCooldownProps = {
  seconds?: number;
  error?: ICommandFunctionProps;
};
export type IOptionCommandArgsValuesProps = {
  max?: number;
  min?: number;
  exact?: number; // main priority over type checking
  enabled?: boolean; // this is the least priority
};
export type IOptionCommandArgsErrorProps = {
  [x in keyof IOptionCommandArgsValuesProps]: ICommandFunctionProps;
};
export type IOptionCommandGuildOnlyProps = {
  error?: ICommandFunctionProps;
};
