import {
  Client,
  ClientOptions,
  Collection,
  Intents,
  MessageEmbed,
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
  IHelpCommandFunction,
  IHelpCommandProps,
} from "../typings/desf";
import { IMiddlewareFunctionProps } from "../typings/middlewares";
import { generateCommandDesc, generateCommandTitle } from "./help";
import { runParser } from "./parse";

/**
 * Create a new Desf instance.
 *  - Options:
 *    - `prefix` is the bot's command prefix
 *    - `strictCommandCasing` will make commands of similar name but different
 *      casing different. Like so, comand `hello` will be different from `Hello` when called, similar with aliases.
 *      Defaults to true.
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
  private _helpFunction?: IHelpCommandProps;

  constructor(
    token: string,
    options?: DesfOptions,
    clientOptions?: ClientOptions,
  ) {
    this._token = token;
    this._options = { strictCommandCasing: true, ...options };
    this.client = new Client({
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
      ...clientOptions,
    });
    this._commands = new Collection();
    this._cooldowns = new Collection();
  }

  /**
   * `.onError` is a custom error handler.
   * - `command` handles errors during running command functions
   * - `middleware` handles errors during running middleware functions
   * - `parse` handles errors during parsing of arguments or command
   */
  onError(e: IErrorEventOptions, f: IErrorFunctionProps) {
    switch (e) {
      case "command":
        return (this._errCommandHandler = f);
      case "middleware":
        return (this._errMiddlewareHandler = f);
      default:
        return;
    }
  }

  /**
   * .user() adds a message parsing middleware.
   * Middlewares are setup to return boolean values in order to know if to continue or not.
   * If there is an error thrown in a middlware, it will be handled by `.onError('middleware', () => {})` function.
   */
  use(f: IMiddlewareFunctionProps) {
    this._middleWares.push(f);
  }

  /**
   * .command() adds a new command to the application.
   * It adds a new item to a Collection to be parsed.
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

      // this will lowercase all command aliases in cooperation with `strictCommandCasing` if set to false
      aliases: this._options?.strictCommandCasing
        ? options?.aliases
        : options?.aliases?.map((e) => e.toLowerCase()),
    };

    this._commands.set(
      this._options?.strictCommandCasing ? name : name.toLowerCase(),
      _command,
    );
  }

  /**
   * This command loops over the commands and adds the ones with
   * cooldowns configured to the new `_cooldowns` Collection.
   */
  private _setupCommandCooldowns() {
    for (const [, cmd] of this._commands) {
      if (cmd.cooldown && cmd.cooldown.seconds) {
        this._cooldowns.set(cmd.name, new Collection());
      }
    }
  }

  private _setupHelpCommand() {
    // if adding auto help is disabled, do nothing
    if (this._options?.disableAutoHelp) return;

    // generate automatic help command
    if (!this._helpFunction) {
      this._helpFunction = {
        command: "help",
        f: (message, commands, { client }) => {
          const emHelp = new MessageEmbed()
            .setTitle(`Help | ${client.user?.username}`)
            .setDescription(
              "These are my defined commands, please use and try them",
            )
            .setAuthor(
              client.user?.username || "Amazing Bot!",
              client.user?.displayAvatarURL() || "",
            )
            .setThumbnail(client.user?.displayAvatarURL() || "")
            .addFields(
              commands.map((c) => {
                return {
                  name: generateCommandTitle(this._options?.prefix || "", c),
                  value: generateCommandDesc(c) || "*(none)*",
                };
              }),
            )
            .setFooter(`© ${client.user?.username}`)
            .setTimestamp(new Date());

          // send help command
          message.reply({ embeds: [emHelp] });
        },
      };
    }
  }

  setHelp(f: IHelpCommandFunction, command = "help", aliases?: string[]) {
    this._helpFunction = {
      f,
      command,
      aliases,
    };
  }

  /**
   * `.run()` runs the bot application.
   * All parsing and handling of commands is handled in here.
   */
  run() {
    // setup help
    this._setupHelpCommand();

    // setup cooldowns
    this._setupCommandCooldowns();

    // on message
    this.client.on("messageCreate", (message) => {
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
      let command = args?.shift() || "";
      if (!this._options?.strictCommandCasing) command = command.toLowerCase();

      // HELP - COMMAND
      if (
        command === this._helpFunction?.command ||
        this._helpFunction?.aliases?.includes(command)
      ) {
        this._helpFunction.f(message, this._commands, {
          client: this.client,
          args,
        });
        return;
      }

      // parse command validation (with aliases if there is)
      const cmd =
        this._commands.get(command) ||
        this._commands.find(
          (cmd) => (cmd.aliases || false) && cmd.aliases.includes(command), // https://discordjs.guide/command-handling/adding-features.html#command-aliases
        );
      if (!cmd) return;

      /* START - COOLDOWN: https://discordjs.guide/command-handling/adding-features.html#cooldowns */
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
            return runParser(cmd.cooldown?.error, [
              message,
              args,
              { client: this.client },
            ]);
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
          const check = i(message, args, { client: this.client });

          if (!check) {
            return;
          }
        } catch (e) {
          // custom handle error by defined function
          if (this._errMiddlewareHandler) {
            // wrap error handler in a try-catch in order to avoid unnecessary crashing of app
            try {
              this._errMiddlewareHandler({
                error: e,
                message,
                args,
                client: this.client,
              });
            } catch (e) {
              console.error(
                `An error has occured on the custom error handler!\nError: ${e}`,
              );
            }
          }
        }
      }

      /* START GUILDONLY VALIDATION: https://discordjs.guide/command-handling/adding-features.html#guild-only-commands */
      if (cmd.guildOnly && message.channel.type === "DM") {
        return runParser(cmd.guildOnly.error, [
          message,
          args,
          { client: this.client },
        ]);
      }
      /* END GUILDONLY VALIDATION */

      /* START - VALIDATE ARGS: https://discordjs.guide/command-handling/adding-features.html#required-arguments */
      if (cmd.args) {
        // exact args has priority over minimum and maximum args
        if (cmd.args.exact && args.length !== cmd.args.exact.length) {
          return runParser(cmd.args.exact.error, [
            message,
            args,
            { client: this.client },
          ]);
        }

        if (cmd.args.min && args.length < cmd.args.min.length) {
          return runParser(cmd.args.min.error, [
            message,
            args,
            { client: this.client },
          ]);
        }

        // maximum args
        if (cmd.args.max && args.length > cmd.args.max.length) {
          return runParser(cmd.args.max.error, [
            message,
            args,
            { client: this.client },
          ]);
        }

        // args should be available
        if (cmd.args.enabled && args.length === 0) {
          return runParser(cmd.args.enabled.error, [
            message,
            args,
            { client: this.client },
          ]);
        }
      }
      /* END - VALIDATE ARGS */

      /// EXECUTE CORRESPONDING COMMAND
      try {
        cmd.execute(message, args, { client: this.client });
      } catch (e) {
        // custom handle error by defined function
        if (this._errCommandHandler) {
          // wrap error handler in a try-catch in order to avoid unnecessary crashing of app
          try {
            this._errCommandHandler({
              error: e,
              message,
              args,
              client: this.client,
            });
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
