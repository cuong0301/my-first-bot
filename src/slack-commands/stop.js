import { joinVoiceChannel } from "@discordjs/voice";

// stop.js
export async function stop(interaction, track, onTrackEnd) {
  if (track) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.channel.send(
        "Bạn cần phải ở trong kênh thoại để dừng nhạc."
      );

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    if (!connection)
      return interaction.channel.send(
        "Bot không đang phát nhạc trong kênh này."
      );
    connection.destroy();
    track.length = 0;
    onTrackEnd();
    return interaction.channel.send("Đã dừng nhạc.");
  }
}
