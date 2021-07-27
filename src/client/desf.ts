import {
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
  Message,
} from "discord.js";
import {
  ICommandFunctionProps,
  ICommandProps,
  IOptionCommandProps,
} from "../typings/commands";
import {
  DesfOptions,
  IErrorEventOptions,
  IErrorFunctionProps,
} from "../typings/desf";
import { IMiddlewareFunctionProps } from "../typings/middlewares";

/**
 * Create a new dispress object.
 */
class Desf {
  private _middleWares: IMiddlewareFunctionProps[] = [];
  private _token: string;
  client: Client;
  private _options?: DesfOptions;
  private _commands: Collection<string, ICommandProps>;
  private _errCommandHandler?: IErrorFunctionProps;
  private _errMiddlewareHandler?: IErrorFunctionProps;

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

  onError(e: IErrorEventOptions, f: IErrorFunctionProps) {
    switch (e) {
      case "command":
        this._errCommandHandler = f;
        break;
      case "middleware":
        this._errMiddlewareHandler = f;
        break;
      default:
        return;
    }
  }

  /**
   * .user() adds a message parsing middleware
   */
  use(f: IMiddlewareFunctionProps) {
    this._middleWares.push(f);
  }

  /**
   * .command() adds a new command
   */
  command(
    name: string,
    execute: ICommandFunctionProps,
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

      // run each middleware
      for (const i of this._middleWares) {
        try {
          const c = i(message, args);

          if (!c) {
            return;
          }
        } catch (e) {
          // custom handle error by defined function
          if (this._errMiddlewareHandler) {
            // wrap error handler in a try-catch in order to avoid unnecessary crashing of app
            try {
              this._errMiddlewareHandler({ error: e, message, args });
            } catch (e) {
              console.error(
                `An error has occured on the custom error handler!\nError: ${e}`,
              );
            }
          }
        }
      }

      // execute corresponding command
      try {
        this._commands?.get(command)?.execute(message, args);
      } catch (e) {
        // custom handle error by defined function
        if (this._errCommandHandler) {
          // wrap error handler in a try-catch in order to avoid unnecessary crashing of app
          try {
            this._errCommandHandler({ error: e, message, args });
          } catch (e) {
            console.error(
              `An error has occured on the custom error handler!\nError: ${e}`,
            );
          }
        }
      }
    });

    // login and run app
    this.client.login(this._token);
  }
}

export { Desf };
