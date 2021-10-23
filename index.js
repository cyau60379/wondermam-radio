const fs = require("fs");

let tokens;
try {
    const data = fs.readFileSync('./tokens.json', 'utf8');
    // parse JSON string to JSON object
    tokens = JSON.parse(data);
} catch (err) {
    console.log(`Error reading file from disk: ${err}`);
    throw new DOMException(`Error: ${err}`);
}

const Discord = require('discord.js');
const WondermamRadio = require("./WondermamRadio");
const client = new Discord.Client();
let wondermamRadio = new WondermamRadio(tokens);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'WMR_proposition') {
        wondermamRadio.updateJSON().then(r => msg.channel.send(wondermamRadio.getMessage()).catch(console.error));
    }
});

client.login(tokens.discord.token);