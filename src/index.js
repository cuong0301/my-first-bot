import dotenv from "dotenv";
import { Client, IntentsBitField, EmbedBuilder } from "discord.js";
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

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;
  if ((msg.content === "Hello") | (msg.content === "Hi")) {
    return msg.channel.send("Daddy Cường chào tất cả các em 🌹");
  }
});
let isPlaying = false;
client.on("messageCreate", async (interaction) => {
  if (interaction.author.bot) return;
  const args = interaction.content.split(" ");
  const link = args[1];
  if (link) {
    track.push(link);
  }

  if (interaction.content === "!help") {
    const helpMessage =
      "Danh sách các lệnh:\n" +
      "!play [link YouTube]: Phát nhạc từ link YouTube\n" +
      "!skip: Bỏ qua bài hát đang phát\n" +
      "!stop: Dừng phát nhạc và xóa danh sách bài hát";

    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription(helpMessage)
      .setColor("#FF69B4");

    return interaction.channel.send({ embeds: [embed] });
  }

  if (interaction.content.startsWith("!play")) {
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
  }

  if (interaction.content.startsWith("!skip")) {
    skip(interaction, track, () => {
      isPlaying = false;
    });
  }

  if (interaction.content.startsWith("!stop")) {
    stop(interaction, track, () => {
      isPlaying = false;
    });
  }

  if (interaction.content.startsWith("!playlist")) {
    playlist(interaction, track, () => {
      isPlaying = false;
    });
  }
});

client.login(process.env.TOKEN);
