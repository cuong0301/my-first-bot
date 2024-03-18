export async function playlist(track) {
  client.on("messageCreate", async (interaction) => {
    if (interaction.content === "!playlist") {
      if (track.length === 0) {
        return interaction.channel.send("Danh sách phát hiện đang trống.");
      } else {
        let playlistMessage =
          "Danh sách các bài hát đang có trong danh sách phát:\n";
        track.forEach((song, index) => {
          playlistMessage += `${index + 1}. ${song}\n`;
        });

        return interaction.channel.send(playlistMessage);
      }
    }
  });
}
