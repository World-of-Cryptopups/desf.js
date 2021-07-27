import { Client, ClientOptions, Collection } from "discord.js";
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
import { runParser } from "./parse";

/**
 * Create a new dispress object.
 */
class Desf {
  private _middleWares: IMiddlewareFunctionProps[] = [];
  private _token: string;
  client: Client;
  private _options?: DesfOptions;
  private _commands: Collection<string, ICommandProps>;
  private _cooldowns: Collection<string, Collection<string, number>>;
  private _errCommandHandler?: IErrorFunctionProps;
  private _errMiddlewareHandler?: IErrorFunctionProps;
  private _errParseHandler?: IErrorFunctionProps;

  constructor(
    token: string,
    options?: DesfOptions,
    clientOptions?: ClientOptions,
  ) {
    this._token = token;
    this._options = options;
    this.client = new Client(clientOptions);
    this._commands = new Collection();
    this._cooldowns = new Collection();
  }

  /**
   * `.onError` is a custom error handler for commands and middlewares
   */
  onError(e: IErrorEventOptions, f: IErrorFunctionProps) {
    switch (e) {
      case "command":
        this._errCommandHandler = f;
        break;
      case "middleware":
        this._errMiddlewareHandler = f;
        break;
      case "parse":
        this._errParseHandler = f;
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

  private _setupCommandCooldowns() {
    for (const [, cmd] of this._commands) {
      if (cmd.cooldown && cmd.cooldown.seconds) {
        this._cooldowns.set(cmd.name, new Collection());
      }
    }
  }

  /**
   * `.run()` runs the bot application
   *
   */
  run() {
    // setup cooldowns
    this._setupCommandCooldowns();

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

      // parse command validation (with aliases if there is)
      const cmd =
        this._commands.get("command") ||
        this._commands.find(
          (cmd) => (cmd.aliases || false) && cmd.aliases.includes(command),
        );
      console.log(cmd);
      if (!cmd) return;

      /* START - COOLDOWN */
      if (this._cooldowns.has(cmd.name)) {
        // get current datetime
        const now = Date.now();

        // get the timestamp of the cooldown
        const ts = this._cooldowns.get(cmd.name);

        // calculate cooldown time or amount
        const cooldownTime = (cmd.cooldown?.seconds || 0) * 1000;

        // if authorid is included in the list,
        if (ts?.has(message.author.id)) {
          // get expiry of cooldown
          const ex = (ts.get(message.author.id) || 0) + cooldownTime;

          // if not yet expired, run the error handler
          if (now < ex) {
            const check = runParser(cmd.cooldown?.error);
            if (typeof check === "string" || !check) {
              if (this._errParseHandler) {
                this._errParseHandler({ error: cmd, message, args });
              }
              return;
            }
          }
        } else {
          ts?.set(message.author.id, now);
        }

        // remove authorid from ts list after cooldown
        setTimeout(() => {
          ts?.delete(message.author.id);
        }, cooldownTime);
      }
      /* END - COOLDOWN */

      // run each middleware
      for (const i of this._middleWares) {
        try {
          const check = i(message, args);

          if (!check) {
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

      /* START GUILDONLY VALIDATION */
      if (cmd.guildOnly) {
        const check = runParser(cmd.guildOnly.error);
        if (typeof check === "string" || !check) {
          if (this._errParseHandler) {
            this._errParseHandler({ error: cmd, message, args });
          }
          return;
        }
      }
      /* END GUILDONLY VALIDATION */

      /*  */

      /* START - VALIDATE ARGS */
      // exact args has priority over minimum and maximum args
      if (cmd.args?.values?.exact && args.length !== cmd.args.values.exact) {
        const check = runParser(cmd.args?.error?.exact);
        if (typeof check === "string" || !check) {
          if (this._errParseHandler) {
            this._errParseHandler({ error: cmd, message, args });
          }
          return;
        }
      } else {
        // minimum args
        if (cmd.args?.values?.min && args.length < cmd.args.values.min) {
          const check = runParser(cmd.args?.error?.min);
          if (typeof check === "string" || !check) {
            if (this._errParseHandler) {
              this._errParseHandler({ error: cmd, message, args });
            }
            return;
          }
        }
        // maximum args
        if (cmd.args?.values?.max && args.length > cmd.args.values.max) {
          const check = runParser(cmd.args?.error?.max);
          if (typeof check === "string" || !check) {
            if (this._errParseHandler) {
              this._errParseHandler({ error: cmd, message, args });
            }
            return;
          }
        }
      }
      /* END - VALIDATE ARGS */

      // execute corresponding command
      try {
        cmd.execute(message, args);
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
