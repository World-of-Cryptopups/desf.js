import Desf from "../../src";

const bot = new Desf(process.env.TOKEN || "", { prefix: "!" });

bot.command("sample", async (message, args) => {
  message.reply("isn't this amazing?");
  message.channel.send("this is cool!");
});

bot.run();
