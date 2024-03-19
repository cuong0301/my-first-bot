import dotenv from "dotenv";
import {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ActivityType,
} from "discord.js";
import ytdl from "ytdl-core";

import { play } from "./slack-commands/play.js";
import { skip } from "./slack-commands/skip.js";
import { stop } from "./slack-commands/stop.js";
import { playlist } from "./slack-commands/playlist.js";

dotenv.config();

const track = [];

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  client.user.setActivity({
    name: "!help",
    type: ActivityType.Listening,
  });
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  const contentLower = msg.content.toLowerCase();
  if (contentLower === "hello" || contentLower === "hi") {
    return msg.channel.send(
      "Daddy Cường chào tất cả các em 🌹, Gõ !help để xem tất cả lệnh nhó 🥰"
    );
  }
});

let isPlaying = false;
client.on("messageCreate", async (interaction) => {
  if (interaction.author.bot) return;
  const args = interaction.content.split(" ");
  const link = args[1];
  const command = args.shift().toLowerCase();
  if (link) {
    track.push(link);
  }

  switch (command) {
    case "!play":
      // Kiểm tra xem người gửi tin nhắn có ở trong kênh thoại không
      if (!interaction.member.voice.channel) {
        return interaction.channel.send(
          "Không ai trong kênh thoại, thì tôi bật ai nghe, bé hư quá 😡"
        );
      }

      // Kiểm tra xem link có hợp lệ không
      if (!ytdl.validateURL(link)) {
        return interaction.channel.send(
          "Link YouTube không đúng rồi bé, check lại xem nào."
        );
      }

      if (!isPlaying) {
        isPlaying = true;
        play(interaction, track, () => {
          isPlaying = false;
        });
      } else {
        const info = await ytdl.getInfo(link);
        interaction.reply(
          `Tôi cho phép em thêm ${info.videoDetails.title} vào danh sách`
        );
      }
      break;

    case "!playlist":
      playlist(interaction, track);
      break;

    case "!skip":
      skip(interaction, track, () => {
        isPlaying = false;
      });
      break;

    case "!stop":
      stop(interaction, track, () => {
        isPlaying = false;
      });
      break;

    case "!help":
      const helpMessage =
        "Danh sách các lệnh:\n" +
        "!play [link YouTube]: Phát nhạc từ link YouTube\n" +
        "!skip: Bỏ qua bài hát đang phát\n" +
        "!stop: Dừng phát nhạc và xóa danh sách bài hát\n" +
        "!playlist: Xem danh sách nhạc đang có";

      const embed = new EmbedBuilder()
        .setTitle("Help")
        .setDescription(helpMessage)
        .setColor("#FF69B4");

      interaction.channel.send({ embeds: [embed] });
      break;

    default:
      break;
  }
});

client.login(process.env.TOKEN);
