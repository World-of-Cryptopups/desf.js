<div align="center">
    <h1>desf</h1>
    <p>A simple Express-Like DiscordJS framework. </p>
</div>

This is just a small wrapper to the DiscordJS library with the help of the guide from https://discordjs.guide.

## Usage

```js
import Desf from "desf";

// create a new instance
const bot = new Desf(process.env.token, { prefix: "!" });

// you can handle other events using the `.client`
// `message` event is handled in the `.run()` function
// and defining so, could override the default functionality of the library
bot.client.on("ready", () => {
  console.log("Client is ready!");
});

bot.command("hello", (message, args) => {
  message.send("Hello! This is Desf!");
});

bot.run();
```

## Limitations

This is only good for small bot applications, please use the default library for larger projects.

##

#### &copy; 2021 | [MIT](./LICENSE)
