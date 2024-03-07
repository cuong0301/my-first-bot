const { EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

module.exports = async function play(message, link) {
  // Kiểm tra xem người gửi tin nhắn có ở trong kênh thoại không
  if (!message.member.voice.channel) {
    return message.reply(
      "Bạn cần phải ở trong kênh thoại để có thể phát nhạc!"
    );
  }

  // Kiểm tra xem link có hợp lệ không
  if (!ytdl.validateURL(link)) {
    return message.reply("Link YouTube không hợp lệ!");
  }

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

    const player = createAudioPlayer();
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
    const info = await ytdl.getInfo(link);

    // Tạo embed để in ra thông tin của bài hát
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(info.videoDetails.title)
      .setURL(info.videoDetails.video_url)
      .setThumbnail(info.videoDetails.thumbnails[0].url)
      .addFields({
        name: "Views",
        value: info.videoDetails.viewCount.toLocaleString(),
        inline: true,
      });

    message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    message.reply("Có lỗi xảy ra khi bắt đầu phát nhạc!");
  }
};
