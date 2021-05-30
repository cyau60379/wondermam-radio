const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'wondermamradio_start') {

        var interval = setInterval(function () {
            msg.reply('')
                .catch(console.error); // add error handling here
        }, 1000);
    }
});

client.login('xxx');