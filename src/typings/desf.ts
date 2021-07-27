import { Message } from "discord.js";
import { ICommandFunctionProps } from "./commands";

export type DesfOptions = {
  prefix?: string;
};

export type IErrorEventOptions = "command" | "middleware";
export type IErrorFunctionArgsProps = {
  error?: any;
  message?: Message;
  args?: string[];
};
export type IErrorFunctionProps = (p: IErrorFunctionArgsProps) => void;
