import { Client, Collection } from "discord.js";
import {
  ISlashCommandFunction,
  ISlashCommandOptions,
  SlashCommandProps,
} from "../typings/slashcommand";

class SlashCommands {
  _client: Client;
  _slashCommands: Collection<string, SlashCommandProps> = new Collection();

  constructor(client: Client) {
    this._client = client;
  }

  slashCommand(
    name: string,
    func: ISlashCommandFunction,
    options: ISlashCommandOptions,
  ) {
    this._slashCommands.set(name, {
      name,
      execute: func,
      ...options,
    });
  }

  start() {
    this._client.on("interactionCreate", async (i) => {
      if (!i.isCommand()) return;

      const { commandName } = i;
    });
  }
}

export { SlashCommands };
