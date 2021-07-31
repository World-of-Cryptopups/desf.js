import Desf from "../../src";

const bot = new Desf(process.env.TOKEN || "", {
  prefix: "!",
  strictCommandCasing: false,
});

bot.client.on("ready", () => {
  console.log("Client is ready!");
});

bot.onError("command", ({ error }) => {
  console.error(error);
});

bot.command(
  "cool",
  (message, args, { client }) => {
    message.reply("hello!");
  },
  {
    cooldown: {
      seconds: 5,
      error: (message) => {
        message.reply("Please wait for 5 seconds!");
      },
    },
  },
);

bot.run();
