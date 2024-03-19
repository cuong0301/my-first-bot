import ytdl from "ytdl-core";

export async function playlist(interaction, track) {
  if (track.length === 0) {
    return interaction.channel.send("Hong có bài nào trong này cả.");
  } else {
    let playlistMessage = "Đây là danh sách các bài hát các em sẽ được nghe:\n";
    for (let i = 0; i < track.length; i++) {
      try {
        const info = await ytdl.getInfo(track[i]);
        playlistMessage += `${i + 1}. ${info.videoDetails.title}\n`;
      } catch (error) {
        console.error(`Lỗi ${i + 1}: ${error}`);
        playlistMessage += `${i + 1}. Unknown\n`;
      }
    }

    return interaction.channel.send(playlistMessage);
  }
}
