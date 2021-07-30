import { Client, Collection, Message } from "discord.js";
import { ICommandProps } from "./commands";

export type DesfOptions = {
  prefix?: string;
  strictCommandCasing?: boolean; // uppercase and lowercase commands are similar
};

export type IHelpCommandFunction = (
  commands: Collection<string, ICommandProps>,
  options: {
    client: Client;
    message: Message;
    args: string[];
  },
) => void;

export type IErrorEventOptions = "command" | "middleware";
export type IErrorFunctionArgsProps = {
  error: any;
  message: Message;
  args: string[];
  client: Client;
};
export type IErrorFunctionProps = (p: IErrorFunctionArgsProps) => void;
