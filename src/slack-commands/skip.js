// skip.js

const queues = {};
module.exports = function skip(message) {
  // Kiểm tra xem người gửi tin nhắn có ở trong kênh thoại không
  if (!message.member.voice.channel) {
    return message.reply(
      "Bạn cần phải ở trong kênh thoại để có thể sử dụng lệnh này!"
    );
  }

  // Lấy thông tin về danh sách đang phát
  const queue = getQueue(message.guild.id);
  if (!queue || queue.length === 0) {
    return message.reply("Không có bài hát nào đang phát!");
  }

  function nextTrack(guildId) {
    function playNextTrack(guildId) {
      const queue = getQueue(guildId);
      if (queue.length > 0) {
        // Lấy bài hát tiếp theo trong danh sách phát
        const nextTrack = queue[0];
        // Phát bài hát tiếp theo
        playTrack(guildId, nextTrack);
      } else {
        stopPlaying(guildId);
        // Không có bài hát nào trong danh sách phát, có thể dừng phát nhạc hoặc gửi thông báo
      }
    }
    const queue = getQueue(guildId);
    // Xóa bài hiện tại từ danh sách phát
    queue.shift();
    // Bắt đầu phát bài tiếp theo nếu có
    playNextTrack(guildId);
  }
  // Nhảy sang bài hát tiếp theo
  nextTrack(message.guild.id);

  message.channel.send("Bài hiện tại đã được skip!");
};
