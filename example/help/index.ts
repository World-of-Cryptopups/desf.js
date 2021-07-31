import Desf from "../../src";

const bot = new Desf(process.env.TOKEN || "", {
  prefix: "!",
  strictCommandCasing: false,
});

bot.client.on("ready", () => {
  console.log("Client is ready!");
});

bot.command(
  "hello",
  (message, args, { client }) => {
    if (args.length > 0) {
      return message.reply(`Hello!: Args: ${args}`);
    }

    return message.reply("Hello!");
  },
  {
    aliases: ["h", "hh", "info"],
    // try to enable this and see the custom help message
    // cooldown: {
    //   seconds: 5,
    //   error: (msg) => {},
    // },
    description: "Hello Command",
    args: {
      values: {
        enabled: true,
      },
      error: {
        enabled: (msg) => {
          msg.reply("You should pass some args!");
        },
      },
    },
  },
);

bot.run();
