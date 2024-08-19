// bot.js
const { Telegraf } = require('telegraf')
const { setupAdminCommands,  } = require('./admin') // Импортируем функции из admin.js
const sqlite3 = require('sqlite3').verbose()
const bot = new Telegraf('7193154733:AAGnhmm5nB9q_3VZN6AqaQYMSfnC3tBP1u8') // Замените на ваш токен бота

// Подключаем админ-команды

setupAdminCommands(bot)



// Здесь можно добавить основной функционал бота


bot.help(ctx => ctx.reply('Здесь вы можете получить помощь.'))

// Запуск бота
bot.launch().then(() => {
    console.log('Бот запущен!')
}).catch(err => {
    console.error('Ошибка запуска бота:', err)
})