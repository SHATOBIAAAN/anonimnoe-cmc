// const { Telegraf, Markup, Scenes, session } = require('telegraf');
// const sqlite3 = require('sqlite3').verbose();

// const bot = new Telegraf('YOUR_BOT_TOKEN');
// const db = new sqlite3.Database('requests.db');

// db.serialize(() => {
//     db.run(`
//         CREATE TABLE IF NOT EXISTS history (
//             user_id TEXT,
//             channel_id TEXT
//         )
//     `);
//     db.run(`
//         CREATE TABLE IF NOT EXISTS channels (
//             channel_id TEXT PRIMARY KEY,
//             link TEXT
//         )
//     `);
// });

// ID админов
const adminIds = [6869290500]; // Замените на реальные ID админов

// Middleware для проверки админов
const adminMiddleware = (ctx, next) => {
    console.log('Проверка ID администратора:', ctx.from.id);
    if (adminIds.includes(ctx.from.id)) {
        return next();
    }
};

// Сцена для добавления канала
const addChannelScene = new Scenes.BaseScene('addChannelScene');

addChannelScene.enter((ctx) => {
    ctx.reply('Введите ID канала и ссылку в формате: <channel_id> <link>', Markup.inlineKeyboard([
        Markup.button.callback('Отмена', 'cancel')
    ]));
});


addChannelScene.action('cancel', (ctx) => {
    ctx.reply('Добавление канала отменено.');
    ctx.scene.leave();
});

// Создаем Stage для сцены
const stage = new Scenes.Stage([addChannelScene]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    db.all("SELECT link FROM channels", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        const buttons = rows.map(row => Markup.button.url('Подписаться', row.link));
        buttons.push(Markup.button.callback('Проверить подписку', 'check_sub'));
        ctx.reply('Подпишитесь на все каналы ниже!', Markup.inlineKeyboard(buttons));
    });
});

bot.action('check_sub', async (ctx) => {
    db.all("SELECT channel_id FROM channels", [], async (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        let cnt = 0;
        for (const row of rows) {
            try {
                const member = await ctx.telegram.getChatMember(row.channel_id, ctx.from.id);
                if (['member', 'administrator', 'creator'].includes(member.status)) {
                    cnt++;
                }
            } catch (e) {
                console.error(`Error checking subscription for user ${ctx.from.id} in channel ${row.channel_id}: ${e}`);
            }
        }
        if (cnt === rows.length) {
            await ctx.answerCbQuery();
            await ctx.editMessageText('Успешная проверка!');
        } else {
            await ctx.answerCbQuery('Подписка не на все каналы!');
        }
    });
});

bot.command('add_channel', adminMiddleware, (ctx) => {
    ctx.scene.enter('addChannelScene');
});

bot.command('remove_channel', adminMiddleware, (ctx) => {
    const [command, channel_id] = ctx.message.text.split(' ');
    if (!channel_id) {
        ctx.reply('Использование: /remove_channel <channel_id>');
        return;
    }
    db.run("DELETE FROM channels WHERE channel_id = ?", [channel_id], (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        ctx.reply(`Канал ${channel_id} удален.`);
    });
});

bot.command('list_channels', (ctx) => {
    db.all("SELECT channel_id, link FROM channels", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        if (rows.length > 0) {
            const response = rows.map(row => `${row.channel_id}: ${row.link}`).join('\n');
            ctx.reply(`Список каналов:\n${response}`);
        } else {
            ctx.reply('Список каналов пуст.');
        }
    });
});

bot.command('check_subscription', async (ctx) => {
    const user_id = ctx.from.id;
    db.all("SELECT channel_id FROM channels", [], async (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        const subscribed_channels = [];
        for (const row of rows) {
            try {
                const member = await ctx.telegram.getChatMember(row.channel_id, user_id);
                if (['member', 'administrator', 'creator'].includes(member.status)) {
                    subscribed_channels.push(row.channel_id);
                }
            } catch (e) {
                console.error(`Error checking subscription for user ${user_id} in channel ${row.channel_id}: ${e}`);
            }
        }
        if (subscribed_channels.length > 0) {
            const response = subscribed_channels.join('\n');
            ctx.reply(`Вы подписаны на следующие каналы:\n${response}`);
        } else {
            ctx.reply('Вы не подписаны ни на один канал.');
        }
    });
});

bot.launch();