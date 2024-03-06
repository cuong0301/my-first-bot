const { Client, IntentsBitField, EmbedBuilder } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// stop.js
module.exports = async function stop(message) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.reply("Bạn cần phải ở trong kênh thoại để dừng nhạc.");

  const connection = joinVoiceChannel({
    channelId: message.member.voice.channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  if (!connection)
    return message.reply("Bot không đang phát nhạc trong kênh này.");

  connection.destroy();
  message.reply("Đã dừng nhạc.");
};
