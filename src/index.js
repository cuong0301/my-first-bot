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

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand) return;

  if (interaction.commandName === "play") {
    const link = interaction.options.get("link").value;
    play(interaction, link);
  }

  if (interaction.commandName === "stop") {
    stop(interaction);
  }

  if (interaction.commandName === "skip") {
    skip(interaction);
  }
});

client.login(process.env.TOKEN);
