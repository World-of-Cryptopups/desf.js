import { Interaction } from "discord.js";

interface SlashCommandProps {
  name: string;
  description: string;
  execute: ISlashCommandFunction;
}

interface ISlashCommandOptions {
  description: string;
  options: [];
}

// eslint-disable-next-line no-unused-vars
type ISlashCommandFunction = (i: Interaction) => any;

export type { SlashCommandProps, ISlashCommandOptions, ISlashCommandFunction };
