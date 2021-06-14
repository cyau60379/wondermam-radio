const Discord = require('discord.js');
const WondermamRadio = require("./WondermamRadio");
const client = new Discord.Client();
let wondermamRadio = new WondermamRadio("https://spreadsheets.google.com/feeds/cells/xxx/1/public/values?alt=json");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'WMR_proposition') {
        wondermamRadio.updateJSON();
        msg.channel.send(wondermamRadio.getMessage())
            .catch(console.error);
    }
});

client.login('xxx');