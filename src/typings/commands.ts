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

// base option
export type IOptionCommandProps = {
  description?: string;
  aliases?: string[];
  cooldown?: IOptionCommandCooldownProps; // TODO: implement custom number of commands in that duration
  args?: {
    min?: IOptionCommandArgsLengthProps;
    max?: IOptionCommandArgsLengthProps;
    exact?: IOptionCommandArgsLengthProps;
    enabled?: IOptionCommandArgsEnabledProps;
  };
  guildOnly?: IOptionCommandGuildOnlyProps;
};

// cooldown
export type IOptionCommandCooldownProps = {
  seconds: number;
  error: ICommandFunctionProps;
};

// args
export type IOptionCommandArgsLengthProps = {
  length: number;
  error: ICommandFunctionProps;
};
export type IOptionCommandArgsEnabledProps = {
  enabled: boolean;
  error: ICommandFunctionProps;
};

// guild-only
export type IOptionCommandGuildOnlyProps = {
  error: ICommandFunctionProps;
};
