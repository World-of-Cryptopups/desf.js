import { Client, Message } from "discord.js";

export type DesfOptions = {
  prefix?: string;
  strictCommandCasing?: boolean; // uppercase and lowercase commands are similar
};

export type IErrorEventOptions = "command" | "middleware";
export type IErrorFunctionArgsProps = {
  error?: any;
  message?: Message;
  args?: string[];
  client?: Client;
};
export type IErrorFunctionProps = (p: IErrorFunctionArgsProps) => void;
