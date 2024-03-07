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

// Danh sách các bài hát được thêm vào danh sách phát
const track = [];
// Biến kiểm tra xem có đang phát nhạc không
let isPlaying = false;

module.exports = async function play(interaction, link) {
  console.log(interaction);
  // Kiểm tra xem người gửi tin nhắn có ở trong kênh thoại không
  if (!interaction.member.voice.channel) {
    return interaction.reply(
      "Bạn cần phải ở trong kênh thoại để có thể phát nhạc!"
    );
  }

  // Kiểm tra xem link có hợp lệ không
  if (!ytdl.validateURL(link)) {
    return interaction.reply("Link YouTube không hợp lệ!");
  }

  // Thêm link vào danh sách phát
  track.push(link);

  // Nếu không có bài hát nào đang được phát, bắt đầu phát từ danh sách phát
  if (!isPlaying) {
    isPlaying = true;
    playMusic(interaction);
  } else {
    interaction.reply("Bài hát đã được thêm vào danh sách phát!");
  }
};

async function playMusic(interaction) {
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

    const player = createAudioPlayer();

    // Nghe sự kiện khi một bài hát kết thúc
    player.on("idle", () => {
      // Loại bỏ bài hát đã phát từ danh sách phát
      track.shift();
      // Nếu còn bài hát trong danh sách phát, phát bài tiếp theo
      if (track.length > 0) {
        playMusic(interaction);
      } else {
        // Nếu không còn bài hát nào trong danh sách phát, đặt biến isPlaying về false
        isPlaying = false;
      }
    });

    const link = track[0];
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

    // Function để chuyển đổi giây thành dạng hh:mm:ss
    function formatDuration(durationInSeconds) {
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      const seconds = durationInSeconds % 60;
      return `${hours > 0 ? hours + ":" : ""}${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    }

    // Tính độ dài của bài hát (track length)

    const trackLength = formatDuration(info.videoDetails.lengthSeconds);
    // Đếm số bài trong danh sách phát
    const numberOfTracks = track.length;

    // Tạo embed để in ra thông tin của bài hát
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle("CÁC EM ĐANG ĐƯỢC NGHE....")
      .setDescription(
        `[${info.videoDetails.title}](${info.videoDetails.video_url})`
      )
      .setThumbnail(info.videoDetails.thumbnails[0].url)
      .addFields(
        {
          name: "Lượt xem",
          value: info.videoDetails.viewCount.toLocaleString(),
          inline: true,
        },
        {
          name: "Thời lượng",
          value: trackLength,
          inline: true,
        }
      )
      .addFields(
        {
          name: "Số bài còn lại",
          value: numberOfTracks.toString(),
        },
        {
          name: "Lượt xem",
          value: info.videoDetails.viewCount.toLocaleString(),
        }
      );

    interaction.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    interaction.reply("Có lỗi xảy ra khi bắt đầu phát nhạc!");
  }
}
