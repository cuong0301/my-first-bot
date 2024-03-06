const {
  VoiceConnectionStatus,
  entersState,
  joinVoiceChannel,
} = require("@discordjs/voice");
const { EmbedBuilder } = require("discord.js");

module.exports = async function skip(message) {
  // Kiểm tra xem có kết nối thoại không
  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });
  if (!connection) {
    return message.channel.send(
      "Bot không đang phát nhạc trong kênh thoại nào cả!"
    );
  }

  try {
    // Đảm bảo rằng kết nối thoại đã sẵn sàng
    entersState(connection, VoiceConnectionStatus.Ready, 20e3)
      .then(() => {
        // Lấy danh sách phát
        const playlist = connection._state.subscription.queue;

        // Kiểm tra xem có bài hát nào khác trong danh sách phát không
        if (playlist.length > 1) {
          // Xóa bài hát hiện tại khỏi danh sách phát
          playlist.shift();

          // Lấy tài nguyên âm thanh của bài hát tiếp theo trong danh sách
          const nextResource = playlist[0];

          // Phát bài hát tiếp theo
          connection._state.subscription.player.play(nextResource);

          // Gửi embed thông tin bài hát tiếp theo
          const nextVideo = nextResource.metadata.source.video;
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(nextVideo.title)
            .setURL(nextVideo.url)
            .setThumbnail(nextVideo.thumbnail)
            .addFields({
              name: `Views: ${nextVideo.views}`,
              value: "\u200B",
              inline: true,
            });
          message.channel.send({ embeds: [embed] });

          // Gửi thông báo đã skip
          message.channel.send("Đã skip bài hát hiện tại!");
        } else {
          // Nếu không có bài hát nào khác trong danh sách, thông báo không thể skip
          message.channel.send(
            "Không có bài hát nào khác trong danh sách phát!"
          );
        }
      })
      .catch((error) => {
        console.error(error);
        message.reply("Có lỗi xảy ra khi thực hiện skip!");
      });
  } catch (error) {
    console.error(error);
    message.reply("Có lỗi xảy ra khi thực hiện skip!");
  }
};
