import { EmbedBuilder } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
  entersState,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import ytdl from "ytdl-core";

export async function play(interaction, track, onTrackEnd) {
  if (track.length === 0) {
    return interaction.channel.send(
      "Danh sách nhạc của bé hong có bài nào cả 😢"
    );
  }
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
        play(interaction, track, onTrackEnd);
      } else {
        onTrackEnd();
        return interaction.channel.send(
          "Hết nhạc ùi, các em muốn nghe gì tiếp 🌹"
        );
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
        quality: "highestaudio",
      }),
      {
        inputType: StreamType.Arbitrary,
      }
    );
    player.play(resource);

    connection.subscribe(player);
    const info = await ytdl.getInfo(link);

    // Tính độ dài của bài hát (track length)

    const trackLength = formatDuration(info.videoDetails.lengthSeconds);
    // Đếm số bài trong danh sách phát
    const numberOfTracks = track.length;

    // Tạo embed để in ra thông tin của bài hát
    const embed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setTitle("Tôi cho phép các em nghe....")
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
      .addFields({
        name: "Số bài còn lại",
        value: numberOfTracks.toString(),
      });

    interaction.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    interaction.channel.send("Có lỗi xảy ra khi bắt đầu phát nhạc!");
  }

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
}
