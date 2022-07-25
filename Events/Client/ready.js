const { Client } = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	/**
	 *
	 * @param {Client} client
	 */
	execute(client) {
		console.log(`Sesión iniciada en Discord como ${client.user.username}`);
	},
};
