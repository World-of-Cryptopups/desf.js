import { Client, Collection, Message } from "discord.js";
import { ICommandProps } from "./commands";

export type DesfOptions = {
  prefix?: string;
  strictCommandCasing?: boolean; // uppercase and lowercase commands are similar
  disableAutoHelp?: boolean; // do not automatically add a help command
};

export type IHelpCommandFunction = (
  message: Message,
  commands: Collection<string, ICommandProps>,
  options: {
    client: Client;
    args: string[];
  },
) => void;

export type IHelpCommandProps = {
  f: IHelpCommandFunction;
  command: string;
  aliases?: string[];
};

export type IErrorEventOptions = "command" | "middleware";
export type IErrorFunctionArgsProps = {
  error: any;
  message: Message;
  args: string[];
  client: Client;
};
export type IErrorFunctionProps = (p: IErrorFunctionArgsProps) => void;
