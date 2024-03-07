require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
  {
    name: "play",
    description: "Add song to play...",
    options: [
      {
        name: "link",
        description: "Link",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
  {
    name: "stop",
    description: "Stop the bot",
  },
  {
    name: "skip",
    description: "Skip to next song",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("Done !!!");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();
