const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const { EmbedBuilder } = require("discord.js");
const { search } = require("play-dl");
const ytdl = require("ytdl-core");

module.exports = async function play(message, link) {
  // Kiểm tra xem người gửi tin nhắn có ở trong kênh thoại không
  if (!message.member.voice.channel) {
    return message.reply(
      "Bạn cần phải ở trong kênh thoại để có thể phát nhạc!"
    );
  }

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

    const player = createAudioPlayer();

    // Tìm kiếm video trên YouTube
    const searchResults = await search(link, { limit: 1 });

    if (searchResults[0]) {
      const video = searchResults[0];
      const resource = createAudioResource(
        ytdl(link, {
          filter: "audioonly",
          fmt: "mp3",
          highWaterMark: 1 << 62,
          liveBuffer: 1 << 62,
          dlChunkSize: 0,
          bitrate: 128,
          quality: "lowestaudio",
        }),
        {
          inputType: StreamType.Arbitrary,
        }
      );
      player.play(resource);
      connection.subscribe(player);
      // Tạo một MessageEmbed để hiển thị thông tin video với màu ngẫu nhiên
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(video.title)
        .setURL(video.url)
        .setThumbnail(video.thumbnail)
        .addFields({
          name: `Views: ${video.views}`,
          value: "\u200B", // This is to add an empty field for spacing
          inline: true,
        });
      // Gửi embed vào kênh
      message.channel.send({ embeds: [embed] });
    } else {
      message.reply("Không tìm thấy video phù hợp!");
    }
  } catch (error) {
    console.error(error);
    message.reply("Có lỗi xảy ra khi bắt đầu phát nhạc!");
  }
};
