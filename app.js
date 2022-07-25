const { Client, Partials, Collection } = require('discord.js');
require('dotenv').config();
const client = new Client({
	intents: 32767,
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.GuildMember,
		Partials.User,
		Partials.ThreadMember,
	],
});

global.colorless = '#2F3136';

const { loadEvents } = require('./Handlers/eventHandler.js');
const { loadCommands } = require('./Handlers/commandHandler.js');

client.commands = new Collection();

client
	.login(process.env.TOKEN)
	.then(() => {
		loadEvents(client);
		loadCommands(client);
	})
	.catch(err => console.log(err));
