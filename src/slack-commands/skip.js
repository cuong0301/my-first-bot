import { EmbedBuilder } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import ytdl from "ytdl-core";

export async function skip(interaction, track, onTrackEnd) {
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  // Kiểm tra nếu danh sách phát không còn bài hát nào
  if (track.length === 1) {
    onTrackEnd();
    track.shift();
    return interaction.channel.send("Không có bài nào tiếp bé ơi 😢");
  }

  // Lấy thông tin của bài hát tiếp theo
  if (track.length > 0) {
    // Lấy thông tin của bài hát hiện tại
    const url = track[0];

    const info = await ytdl.getInfo(url);

    track.shift(); // Xóa bài hát hiện tại khỏi danh sách track

    const nextUrl = track[0];
    const nextInfo = await ytdl.getInfo(nextUrl);

    // Tạo resource cho bài hát tiếp theo
    const resource = createAudioResource(
      await ytdl(nextUrl, {
        filter: "audioonly",
        fmt: "mp3",
        highWaterMark: 1 << 25,
        quality: "highestaudio",
      }),
      {
        inputType: StreamType.Arbitrary,
      }
    );
    // Tạo một Embed để thông báo cho người dùng rằng bài hát đã được skip
    const skipEmbed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setDescription(
        `Không nghe ${info.videoDetails.title} nữa thì nghe ${nextInfo.videoDetails.title}`
      )
      .setThumbnail(info.videoDetails.thumbnails[0].url);

    // Phản hồi với Embed trên
    await interaction.channel.send({ embeds: [skipEmbed] });
    // Phát bài hát tiếp theo
    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);
  } else {
    // Nếu không có bài hát nào đang được phát, phản hồi với thông báo tương ứng
    onTrackEnd();
    return interaction.channel.send("Không có bài nào tiếp bé ơi 😢");
  }
}
