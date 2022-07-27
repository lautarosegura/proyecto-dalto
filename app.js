const {
	Client,
	Partials,
	Collection,
	GatewayIntentBits,
} = require('discord.js');
require('dotenv').config();
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
	],
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
const { loadModals } = require('./Handlers/modalHandler.js');
const { loadButtons } = require('./Handlers/buttonHandler.js');
require('./Handlers/databaseHandler')(client);

client.commands = new Collection();
client.modals = new Collection();
client.buttons = new Collection();

client
	.login(process.env.TOKEN)
	.then(() => {
		client.removeAllListeners();
		loadEvents(client);
		loadCommands(client);
		loadModals(client);
		loadButtons(client);
		client.dbLogin();
	})
	.catch(err => console.log(err));
