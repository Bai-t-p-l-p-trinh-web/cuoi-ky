require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const User = require("../../user/user.model");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Vui lòng gửi số điện thoại của bạn (VD: +84912345678)"
  );

  bot.once("message", async (msg) => {
    const phoneNumber = msg.text.trim();
    const telegramUserId = msg.from.id;

    const user = await User.findOne({ phoneNumber });
    if (user) {
      await User.findOneAndUpdate({ phoneNumber }, { telegramUserId });
      bot.sendMessage(chatId, "✅ Tài khoản đã liên kết với Telegram!");
    } else {
      bot.sendMessage(
        chatId,
        "❌ Không tìm thấy số điện thoại. Vui lòng kiểm tra lại."
      );
    }
  });
});

module.exports = bot;
