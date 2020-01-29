const { Client, RichEmbed, Discord, Attachment } = require("discord.js");
const { Guild } = require("discord.js");
const { config } = require("dotenv");
var fs = require('fs');
let level = require("./level.json");
const Canvas = require('canvas');
const commando = require('discord.js-commando');


config({
    path: __dirname + "/.env"
})

// Declares our bot,
// the disableEveryone prevents the client to ping @everyone
const client = new Client({
    disableEveryone: true
});
const guild = new Guild({
    disableEveryone: true
});

const ytdl = require("ytdl-core");

var queue = new Map();

var curentChannel;


// When the bot's online, what's in these brackets will be executed
client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);
    
     pool.connect( (err, client, done) => {
            client.query('create table if not exists users( \
                id text primary key, \
                name text, \
                count integer default 0)', (err, result) => {
                    //disconnent from database on error
                    done(err);
            });
    });

    // Set the user presence
    client.user.setPresence({
        status: "online",
        game: {
            name: "NewHeaven",
            type: "Playing"
        }
    });

    commandBotChannel = client.channels.filter(c => c.id === '665733268477444165').get('665733268477444165');
    musicVoiceChannel = client.channels.filter(c => c.id === '533527442132828163').get('533527442132828163');
    musicTextChannel = client.channels.filter(c => c.id === '534043453042982933').get('534043453042982933');

    client.guilds.get('533289582213726209').members.get('376557542177767445').send('Online!');

    setInterval(() => {
        const voiceChannels = client.channels.filter(c => c.type === 'voice');
        for (const [id, voiceChannel] of voiceChannels) {
            for (const [uid, member] of voiceChannel.members) {
                var info = level['level'].find(x => x.uid === uid);
                upExp(info, 1.25, uid)
            }
        }

        fs.writeFile('./level.json', JSON.stringify(level), (err) => {
            if (err) console.log(err);
        });

        var d = new Date();
        if ((d.getHours() === 6 || d.getHours() == 18) && d.getMinutes() === 00) {
            client.guilds.get('533289582213726209').members.get('376557542177767445').send('', { files: ['./level.json'] });
        }
    }, 60000);

})

// When a message comes in, what's in these brackets will be executed
client.on("message", async message => {
    if (!message.member) {
        return;
    }

    const serverQueue = queue.get(message.guild.id);

    const prefix = "hm!";
    const uid = message.member.id;

    // Tăng exp khi chat 
    var info = level['level'].find(x => x.uid === uid);
    upExp(info, 0.0625, uid);
    // Tăng exp khi chat end


    // If the author's a bot, return
    // If the message was not sent in a server, return
    // If the message doesn't start with the prefix, return
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    // Arguments and command variable
    // cmd is the first word in the message, aka the command
    // args is an array of words after the command
    // !say hello I am a bot
    // cmd == say (because the prefix is sliced off)
    // args == ["hello", "I", "am", "a", "bot"]
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = (args.shift()).toLowerCase();

    let embed = new RichEmbed();

    switch (cmd) {

        case 'help':
            embed = new RichEmbed()
                .setColor("#98D989")
                .setDescription('Không có lệnh nào hêt :)')
                .setAuthor('Danh sách các lệnh HM', client.user.displayAvatarURL);

            message.channel.send(embed);
            break;

        case 'say':
            // Check if you can delete the message
            if (message.deletable) message.delete();

            if (args.length === 0) {
                message.reply(`Nothing to say?`).then(m => m.delete(5000));
                break;
            };

            // If the first argument is embed, send an embed,
            // otherwise, send a normal message
            if (args[0].toLowerCase() === "embed") {
                embed = new RichEmbed()
                    .setDescription(args.slice(1).join(" "))
                    .setColor("#98D989")
                    .setTitle('1234')
                    .setDescription('1234');
                // .setImage(client.user.displayAvatarURL)
                // .setAuthor(message.author.username, message.author.displayAvatarURL);

                message.channel.send(embed);
            } else {
                message.channel.send(args.join(" "));
            }
            break;

        case 'nickname':
            if (args.join(" ") === 'clear') {
                message.member.setNickname(`HM | ${message.author.username}`);
            } else {
                message.member.setNickname(`HM | ${args.join(" ")}`);
            }
            break;

        case 'level':
            if (args[0]) {
                switch (args[0]) {
                    case 'set':
                        const lv = Number(args[2]).toFixed(0);
                        if (args[1] && !isNaN(lv)) {
                            if (lv > 0) {
                                const uid = args[1].replace('<@!', '').replace('>', '');
                                var info = level['level'].find(x => x.uid === uid);
                                if (info) {
                                    info['xp'] = 0;
                                    info['level'] = lv;
                                } else {
                                    message.reply('Không tìm thấy id trong hệ thống !').then(m => m.delete(10000));
                                }
                            } else {
                                message.reply('Hãy nhập số dương !').then(m => m.delete(10000));
                            }
                        } else {
                            message.reply('Hãy nhập level và là số !').then(m => m.delete(10000));
                        }
                        break;

                    case 'help':
                        embed = new RichEmbed()
                            .setColor("#98D989")
                            .setDescription('soon...')
                            .setAuthor('Danh sách các lệnh level', client.user.displayAvatarURL);

                        message.channel.send(embed);
                        break;

                    case 'top':
                        level['level'].sort(GetSortOrder('level', 'xp'));

                        const top1 = level['level'][0] ? `<@!${level['level'][0].uid}> - Level: ${level['level'][0].level}` : '';
                        const top2 = level['level'][1] ? `<@!${level['level'][1].uid}> - Level: ${level['level'][1].level}` : '';
                        const top3 = level['level'][2] ? `<@!${level['level'][2].uid}> - Level: ${level['level'][2].level}` : '';
                        const top4 = level['level'][3] ? `<@!${level['level'][3].uid}> - Level: ${level['level'][3].level}` : '';
                        const top5 = level['level'][4] ? `<@!${level['level'][4].uid}> - Level: ${level['level'][4].level}` : '';

                        const embedTop = new RichEmbed()
                            .setColor("#98D989")
                            .setDescription(`Top 1 : ${top1}
                            Top 2 : ${top2}
                            Top 3 : ${top3}
                            Top 4 : ${top4}
                            Top 5 : ${top5}
                            ...
                            `)

                            .setAuthor('Xếp hạng level discord - NewHeaven', client.user.displayAvatarURL);

                        message.channel.send(embedTop);
                        break;
                    default:
                        message.reply('Hãy sử dụng `hm! level help` để biết thêm về các lệnh !').then(m => m.delete(10000));
                        break;
                }
            } else {
                level['level'].sort(GetSortOrder('level', 'xp'));
                const canvas = Canvas.createCanvas(725, 275);
                const ctx = canvas.getContext('2d');
                const avatar = message.member.user.displayAvatarURL !== 'https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png' ? await Canvas.loadImage(message.member.user.displayAvatarURL)
                    : await Canvas.loadImage('./avatarDefault.jpg');

                var info = level['level'].find(x => x.uid === uid);
                const top = level['level'].indexOf(info) + 1;
                let countLevel = info['level'] - 1;

                let totalExp = 42.25 * countLevel + info['xp'];
                let count = 0;

                for (let index = 0; index < countLevel; index++) {
                    count += index
                }

                totalExp += 40 * count;

                const currentXp = info['xp'];
                const nextXp = 42.25 + 40 * info['level'];

                ctx.beginPath();
                var grd = ctx.createLinearGradient(150, 0, 425, 0);
                grd.addColorStop(0, "#1755b3");
                grd.addColorStop(1, "#0e3671");
                ctx.fillStyle = grd;
                ctx.moveTo(725, 275);
                ctx.lineTo(725, 0);
                ctx.lineTo(300, 0);
                ctx.lineTo(250, 275);
                ctx.lineTo(725, 275);
                ctx.drawImage(avatar, 0, 0, 300, 275);

                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(725, 275);
                ctx.lineTo(725, 150);
                ctx.lineTo(273, 150);
                ctx.lineTo(259, 225);
                ctx.lineTo(725, 225);
                ctx.fillStyle = '#00112890'
                ctx.fill();

                // For Display XP Start
                ctx.beginPath();
                ctx.moveTo(682, 275);
                ctx.lineTo(682, 52);
                ctx.lineTo(348, 52);
                ctx.lineTo(348, 23);
                ctx.lineTo(682, 23);
                ctx.fillStyle = '#96a4b9'
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(680, 275);
                ctx.lineTo(680, 50);
                ctx.lineTo(350, 50);
                ctx.lineTo(350, 25);
                ctx.lineTo(680, 25);
                ctx.fillStyle = 'white'
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(351 + 328 * (currentXp / nextXp), 275);
                ctx.lineTo(351 + 328 * (currentXp / nextXp), 49);
                ctx.lineTo(351, 49);
                ctx.lineTo(351, 26);
                ctx.lineTo(351 + 328 * (currentXp / nextXp), 26);
                ctx.fillStyle = '#7287a7'
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(441, 220);
                ctx.lineTo(441, 135);
                ctx.lineTo(440, 135);
                ctx.lineTo(440, 70);
                ctx.lineTo(441, 70);
                ctx.fillStyle = 'white'
                ctx.fill();

                // For Display XP Start End

                ctx.font = "30px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'right'
                ctx.fillText(`HM | ${message.author.username}`, 700, 200);

                ctx.font = "16px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'right'
                ctx.fillText("New Heaven - Server MineCraft Việt Nam", 710, 260);

                // XP display
                ctx.font = "16px Consolas";
                ctx.fillStyle = "black";
                ctx.fillText(`XP: ${currentXp} / ${nextXp}`, 580, 43);

                // Hiển thị LEVEL
                ctx.font = "bold 15px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.fillText("LEVEL", 410, 78);

                ctx.font = "48px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'center'
                ctx.fillText(info['level'], 385, 125);

                ctx.font = "17px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'left'
                ctx.fillText("Server rank : ", 460, 90);

                ctx.font = "17px Consolas";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'left'
                ctx.fillText(`#${top}`, 580, 90);

                ctx.font = "17px Arial";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'left'
                ctx.fillText("Server exp : ", 460, 125);

                ctx.font = "17px Consolas";
                ctx.fillStyle = "#fffffff9";
                ctx.textAlign = 'left'
                ctx.fillText(totalExp.toFixed(0), 580, 125);

                const attachment = new Attachment(canvas.toBuffer(), `level.png`);
                message.channel.send(attachment);
            }

            break;


        case 'test':
            const embedTest = new RichEmbed()
                .setColor("#98D989")
                .setDescription(`Top 1 : <@!${level['level'][0].uid}>
                123`)
                .setAuthor('Danh sách các lệnh level', client.user.displayAvatarURL);

            message.channel.send(embedTest);
            break;

        /** Music Bot - NewHeaven */
        case 'music':
        case '-m':
            if (args[0]) {
                switch (args[0]) {
                    case 'play': case '-p':
                        if (args[1]) {
                            if (!curentChannel) {
                                if (!message.member.voiceChannelID) {
                                    message.reply('Hãy tham gia voice channel !').then(m => m.delete(10000));
                                    break;
                                }
                                curentChannel = client.channels.filter(c => c.id === message.member.voiceChannelID).get(message.member.voiceChannelID);
                            }
                            await curentChannel.join();

                            // Search trên youtube 
                            let results = await search(args.slice(1).join(" "), opts).catch(err => console.log(err));
                            if (results) {
                                let youtubeResults = results.results;
                                await run(message, youtubeResults)
                            }
                        }
                        break;
                    case 'next': case '-n':
                        // Check if you can delete the message
                        if (message.deletable) message.delete();

                        if (curentChannel) {
                            if (!votingFlg) {
                                let countDown = 30;
                                let interval;

                                embed = new RichEmbed()
                                    .setColor("#CC99FF")
                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                    .setDescription(`<@!${message.author.id}> vừa yêu cầu chuyển bài hát. 
                            Thời gian còn lại : ${countDown}
                            :iconYes: : Đồng ý    :iconNo: Không đồng ý`);
                                message.channel.send(embed).then((msg) => {
                                    msg.react('667753397490941982');
                                    msg.react('667753909418459178');
                                    votingFlg = true;

                                    interval = setInterval(() => {
                                        countDown--;
                                        embed = new RichEmbed()
                                            .setColor("#CC99FF")
                                            .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                            .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                Thời gian còn lại : ${countDown}
                                <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                        msg.edit(embed);
                                        if (countDown === 1) {
                                            let countYes = msg.reactions.get('iconYes:667753397490941982').count;
                                            let countNo = msg.reactions.get('iconNo:667753909418459178').count;

                                            if (countYes > countNo) {
                                                embed = new RichEmbed()
                                                    .setColor("#CC99FF")
                                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                                    .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                        Kết quả : Chuyển bài
                                        <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                                if (dispatcherStream) {
                                                    dispatcherStream.end();
                                                }
                                            } else {
                                                embed = new RichEmbed()
                                                    .setColor("#CC99FF")
                                                    .setAuthor('Yêu cầu chuyển bài hát !', client.user.displayAvatarURL)
                                                    .setDescription(`<@!${msg.author.id}> vừa yêu cầu chuyển bài hát. 
                                        Kết quả :Không chuyển bài
                                        <:iconYes:667753397490941982> : Đồng ý    <:iconNo:667753909418459178> Không đồng ý`);
                                            }

                                            msg.edit(embed).then(m => m.delete(2000));
                                            clearInterval(interval);

                                            votingFlg = false;
                                        }
                                    }, 1000);
                                });
                            } else {
                                message.reply('Đang vote rồi kìa má ==! ').then(m => m.delete(5000));
                            }

                        } else {
                            message.reply('Đùa tôi à ! Có phát nhạc đâu mà next :| ').then(m => m.delete(5000));
                        }
                        break;

                    case 'loop': case '-l':
                        if (loopMusicFlg) {
                            loopMusicFlg = false;
                            message.reply('Đã tắt chế dộ lặp bài hát !').then(m => m.delete(10000));
                        } else {
                            loopMusicFlg = true;
                            message.reply('Đã bật chế dộ lặp bài hát !').then(m => m.delete(10000));
                        }
                        break;
                    case 'help | -h':
                    default:
                        replyHelpMessage(message);
                        break;
                }
            } else {

            }
            break;

        case '2781998':
            if (message.deletable) message.delete();
            client.guilds.get('533289582213726209').members.get('376557542177767445').send('', { files: ['./level.json'] });
            break;

        default:
            message.channel.send('Hãy sử dụng `hm! help` để biết thêm về các lệnh !');
            break;
    }

    fs.writeFile('./level.json', JSON.stringify(level), (err) => {
        if (err) console.log(err);
    });

});

client.on('guildMemberUpdate', (oldData, newData) => {
    try {
        if (!oldData._roles.includes('660671267917135883') && newData._roles.includes('660671267917135883')) {
            oldData.guild.members.get(oldData.user.id).setNickname(`HM | ${newData.user.username}`)
            // oldData.guild.members.get(oldData.user.id).setRoles("661800721251041291")
        } else if (!newData._roles.includes('660671267917135883')) {
            oldData.guild.members.get(oldData.user.id).setNickname('');
        }
    } catch (error) {
        console.info('Không có quyền thay đổi nickName !');
    }
})

// Login the bot
client.login(process.env.TOKEN);

function GetSortOrder(prop, prop2) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        } else if (a[prop] === b[prop]) {
            if (a[prop2] < b[prop2]) {
                return 1;
            } else if (a[prop2] > b[prop2]) {
                return -1;
            }
        }
        return 0;
    }
}

function upExp(info, exp, uid) {

    var ignoreList = ['661762216105738261', '234395307759108106', '204255221017214977', '534416871290699796'];

    if (ignoreList.indexOf(uid) >= 0) {
        return;

    }

    if (!info) {
        info = {
            uid,
            xp: exp,
            level: 1
        }
        level['level'].push(info);
    } else {
        var levelCurrent = Number(info['level']);
        info['xp'] += exp;
        if (info['xp'] > 42.25 + 40 * levelCurrent) {
            info['xp'] = info['xp'] - (42.25 + 40 * levelCurrent);
            levelCurrent += 1;
        }
    }
}

/**********************************************************  MUSIC **********************************************************/

const search = require('youtube-search');
const opts = {
    maxResults: 1,
    key: process.env.YOUTUBE_API,
    type: 'video'
};
const streamOptions = {
    seek: 0,
    volume: 1
}
var musicQueue = [];
var dispatcherStream;

var loopMusicFlg = false;

async function run(msg, result) {
    youtubeUrl = result[0].link;
    let title = result[0].title;

    if (musicQueue.some(x => x.url === youtubeUrl)) {
        msg.reply(`Đã tồn tại bài hát vừa yêu cầu trong danh sách phát !`).then(m => m.delete(5000));
    } else if (ytdl.validateURL(youtubeUrl)) {
        musicQueue.push({ title: title, url: youtubeUrl, authorId: msg.author.id, username: msg.author.username, avatarURL: msg.author.displayAvatarURL });
        let vc = curentChannel;
        if (vc && vc.connection) {
            if (!vc.connection.speaking) {
                await playSong(vc.connection, msg);
            }
            else {
                msg.reply(`Đã thêm bài hát : ${title} vào danh sách phát !`);
            }
        }
    } else {
        msg.reply(`Có lỗi xảy ra khi tìm kiếm bài hát !`).then(m => m.delete(5000));
    }
}

async function playSong(connection, msg) {
    const stream = ytdl(musicQueue[0].url, { filter: 'audioonly' });
    dispatcherStream = connection.playStream(stream, streamOptions);

    dispatcherStream.on('start', () => {
        embed = new RichEmbed()
            .setColor("#98D989")
            .setAuthor(musicQueue[0].username, musicQueue[0].avatarURL)
            .setDescription(`${musicQueue[0].title}
            「<@!${musicQueue[0].authorId}>」`);
        msg.channel.send(embed);
    });

    dispatcherStream.on('end', () => {
        var musicTemp = musicQueue.shift();

        if (loopMusicFlg) {
            musicQueue.push(musicTemp);
        } else {

        }

        if (musicQueue.length === 0) {
            curentChannel.leave();
            curentChannel = null;
        } else {
            setTimeout(() => {
                playSong(connection, msg);
            }, 500)
        }
    })
}

function replyHelpMessage(message) {
    var content = `
    \`hm! music <key> \`
    - \`play\` <Tên bài hát>\t\t\t\tThêm bài vào danh sách phát
    - \`next\`\t\t\t\tChuyển bài hát tiếp theo ( Sẽ cập nhât tính năng vote ...)
    - \`loop\`\t\t\t\tBật/Tắt chế độ lặp lại danh sách phát
    Có thể sử dụng command tắt VD : hm! -m -n = hm! music next
    `;

    embed = new RichEmbed()
        .setColor("#98D989")
        .setAuthor(message.author.username, message.author.displayAvatarURL)
        .setDescription(content);
    message.channel.send(embed);
}

/**********************************************************  MUSIC END **********************************************************/

/*********************************************************** LEVEL **************************************************************/

var pool = require ('./clientpool.js');

/**********************************************************  LEVEL END **********************************************************/
