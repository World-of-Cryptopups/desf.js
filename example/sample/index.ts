import Desf from "../../src";

const bot = new Desf(process.env.TOKEN || "", { prefix: "!" });

bot.client.on("ready", () => {
  console.log("Client is ready!");
});

bot.onError("command", ({ error }) => {
  console.error(error);
});

bot.command("error", (message, args) => {
  message.channel.send("this will error!");

  throw new Error("custom error handler");
});

bot.command(
  "sample",
  async (message, args) => {
    message.reply("isn't this amazing?");
    message.channel.send("this is cool!");
  },
  { aliases: ["sam"] },
);

bot.run();
