import {
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
  Message,
} from "discord.js";
import { ICommandProps, IOptionCommandProps } from "../typings/commands";
import { DesfOptions } from "../typings/desf";

/**
 * Create a new dispress object.
 */
class Desf {
  private _token: string;
  client: Client;
  private _options?: DesfOptions;
  private _commands: Collection<string, ICommandProps>;

  constructor(
    token: string,
    options?: DesfOptions,
    clientOptions?: ClientOptions,
  ) {
    this._token = token;
    this._options = options;
    this.client = new Client(clientOptions);
    this._commands = new Collection();
  }

  /**
   * .command() adds a new command
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
    // on message
    this.client.on("message", (message) => {
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

    // login and run app
    this.client.login(this._token);
  }
}

export { Desf };
