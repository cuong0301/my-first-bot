require("dotenv").config();
const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const play = require("./slack-commands/play");
const stop = require("./slack-commands/stop");
const skip = require("./slack-commands/skip");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if ((msg.content === "Hello") | (msg.content === "Hi")) {
    msg.channel.send("Daddy Cường chào tất cả các em 🌹");
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!play")) {
    const args = message.content.split(" ");
    const link = args[1];
    play(message, link);
  }

  if (message.content.startsWith("!stop")) {
    stop(message);
  }

  if (message.content.startsWith("!skip")) {
    skip(message);
  }

  // if (message.content.startsWith("!skip")) {
  //   skip(message);
  // }
});

client.login(process.env.TOKEN);
