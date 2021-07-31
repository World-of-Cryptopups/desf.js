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
      // if these are not defined, the correspondings errors will not execute
      values: {
        min: 1,
        max: 2,
        exact: 2, // it takes priority over `min` and `max`
      },
      error: {
        min: (message) => {
          message.reply("Needed atleast 1 argument!");
        },
        max: (message) => {
          message.reply("Too much args!");
        },
        exact: (message) => {
          message.reply("I need an exact of 2 args!");
        },
      },
    },
  },
);

bot.run();
