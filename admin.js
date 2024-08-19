const { Markup } = require('telegraf')

// Задаем список ID администраторов
const adminIds = [6869290500, 987654321] // Замените на реальные ID администраторов

function setupAdminCommands(bot) {
	// Команда /adm выводит меню админа
	bot.command('adm', ctx => {
		if (adminIds.includes(ctx.from.id)) {
			ctx.reply(
				'Админ меню:',
				Markup.inlineKeyboard([
					[Markup.button.callback('сделать рассылку', 'admin_btn_1')],
					[Markup.button.callback('Кнопка 2', 'admin_btn_2')],
				])
			)
		}
	})

	// Обработчик нажатия кнопки 1


	// Обработчик нажатия кнопки 2
	bot.action('admin_btn_2', ctx => {
		if (adminIds.includes(ctx.from.id)) {
			ctx.answerCbQuery()
			ctx.reply('Вы нажали на кнопку 2')
		}
	})
}

module.exports = { setupAdminCommands }
