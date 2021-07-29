import { Client, Message } from "discord.js";

export type DesfOptions = {
  prefix?: string;
};

export type IErrorEventOptions = "command" | "middleware" | "parse";
export type IErrorFunctionArgsProps = {
  error?: any;
  message?: Message;
  args?: string[];
  client?: Client;
};
export type IErrorFunctionProps = (p: IErrorFunctionArgsProps) => void;
