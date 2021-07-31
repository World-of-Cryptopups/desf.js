import Desf from "../../src";

const bot = new Desf(process.env.TOKEN || "", {
  prefix: "!",
  strictCommandCasing: false,
});

bot.client.on("ready", () => {
  console.log("Client is ready!");
});

bot.command(
  "args",
  async (message, args) => {
    message.reply("isn't this amazing?");
    message.channel.send("this is cool!");
  },
  {
    args: {
      min: {
        length: 1,
        error: (message) => {
          message.reply("Needed atleast 1 argument!");
        },
      },
      max: {
        length: 3,
        error: (message) => {
          message.reply("Too much args!");
        },
      },
      // exact: {
      //   length: 3,
      //   error: (message) => {
      //     message.reply("I need an exact of 3 args!");
      //   },
      // },
    },
  },
);

bot.run();
