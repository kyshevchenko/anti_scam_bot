import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import bannedWords from "./banned-words.js";

dotenv.config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const adminId = process.env.ADMIN_ID; // ID админа, который не будет баниться

// Функция проверки на запрещенные слова
function containsBannedWords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return bannedWords.some((word) => lowerText.includes(word));
}

// Обработка новых сообщений
bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const userId = msg.from.id;
    const text = msg.text || msg.caption || "";

    // Пропускаем сообщения от самого бота
    if (msg.from.is_bot || userId === adminId) {
      return;
    }

    // Проверяем на запрещенные слова
    if (containsBannedWords(text)) {
      console.log(`Обнаружено запрещенное слово от ${userId}: ${text}`);

      try {
        // Удаляем сообщение
        await bot.deleteMessage(chatId, messageId);
        console.log(`Сообщение удалено: ${messageId}`);

        // Баним пользователя
        await bot.banChatMember(chatId, userId);
        console.log(`Пользователь забанен: ${userId}`);
      } catch (error) {
        console.error("Ошибка при модерации:", error);
      }
    }
  } catch (error) {
    console.error("Ошибка в обработчике сообщений:", error);
  }
});

// Обработка ошибок
bot.on("error", (error) => {
  console.error("Ошибка бота:", error);
});
