// got from:: https://discordjs.guide/miscellaneous/parsing-mention-arguments.html#implementation

import { Message } from "discord.js";

/**
 * Parse and get the userid from the mention string.
 *
 * @param mention - the mention argument to parse
 * @returns
 */
const getUserIDFromMention = (mention: string) => {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return mention;
  }
};

/**
 *
 * Parse and return the user from the mention string. It will first get the userid and then tries to fetch the user.
 *
 * @param mention - the mention argument to parse
 * @param message - discord.js `Message`
 * @returns
 */
const getUserFromMention = (mention: string, message: Message) => {
  const userid = getUserIDFromMention(mention);
  if (!userid) return;

  return message.guild?.members.cache.get(userid);
};

export { getUserIDFromMention, getUserFromMention };
