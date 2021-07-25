import { Client, Collection, Message } from "discord.js";
import { ICommandProps, IOptionCommandProps } from "../types/commands";
import { DesfOptions } from "../types/desf";

/**
 * Create a new dispress object.
 */
class Desf {
  _token: string;
  _client: Client;
  _options?: DesfOptions;
  _commands: Collection<string, ICommandProps>;

  constructor(token: string, options?: DesfOptions) {
    this._token = token;
    this._options = options;
    this._client = new Client();
    this._commands = new Collection();
  }

  /**
   * .command() adds a new command to
   */
  command(
    name: string,
    execute: (message: Message, args: string[]) => {},
    options?: IOptionCommandProps,
  ) {
    const _command: ICommandProps = {
      name,
      execute,
      ...options,
    };

    this._commands.set(name, _command);
  }

  /**
   * `.run()` runs the bot application
   *
   */
  run() {
    // on ready app
    this._client.on("ready", () => {
      console.log("Ready!");
    });

    // on message
    this._client.on("message", (message) => {
      if (
        !message.content.startsWith(this._options?.prefix || "") ||
        message.author.bot
      )
        return;

      // parse message content
      const args = message.content
        .slice(this._options?.prefix?.length)
        .trim()
        .split(/ +/);
      const command = args?.shift()?.toLowerCase() || "";

      if (!this._commands.has(command)) return;

      // execute corresponding command
      try {
        this._commands?.get(command)?.execute(message, args);
      } catch (e) {
        console.error(e);
        message.reply(
          "There was a problem in trying to execute that command! If problem persists, please contact an admin and try again.",
        );
      }
    });

    // run app,
    this._client.login(this._token);
  }
}

export { Desf };
