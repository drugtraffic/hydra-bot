/* includes */
const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');
const mongoose = require('mongoose');
const { magenta, red } = require('chalk');

/* defines & config */
const bot = new Discord.Client({ ws: { properties: { $browser: "Discord iOS" } } });
const readdir = util.promisify(fs.readdir);

bot.events = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.data = require('./database/MongoDB.js');
bot.logger = require('./funcs/logger.js');
bot.tools = require('./funcs/tools.js');
bot.config = require('./utils/config.json');

async function initialize() {

    console.log(red(`

    ██╗  ██╗██╗   ██╗██████╗ ██████╗  █████╗ 
    ██║  ██║╚██╗ ██╔╝██╔══██╗██╔══██╗██╔══██╗
    ███████║ ╚████╔╝ ██║  ██║██████╔╝███████║
    ██╔══██║  ╚██╔╝  ██║  ██║██╔══██╗██╔══██║
    ██║  ██║   ██║   ██████╔╝██║  ██║██║  ██║
    ╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝                               
      
        Hydra Bot | Author: py#0507

`));


    // load events
    let events = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
    for (let e of events) {
        let eventFile = require('./events/' + e);
        let eventName = e.split('.')[0];
        bot.logger.event(eventName + ' loaded.');
        bot.on(eventName, eventFile.bind(null, bot));
    }

    // load commands
    let categories = await readdir('./commands/');
    categories.forEach(c => {
        let commands = fs.readdirSync('./commands/' + c + '/').filter(file => (file.endsWith('.js')));
        for (const file of commands) {
            let commandFile = require('./commands/' + c + '/' + file);
            bot.commands.set(commandFile.name, commandFile);
        }
        bot.logger.cmd(c + ' - ' + commands.length + ' commands loaded.');
    });

    // init database
    mongoose.connect(bot.config.mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        bot.logger.log('MongoDB connected.');
    }).catch((err) => {
        bot.logger.error('MongoDB error - ' + err);
    });

    // login bot
    bot.login(bot.config.token)
}

initialize();
