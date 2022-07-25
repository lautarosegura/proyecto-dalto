const { CommandInteraction } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {CommandInteraction} interaction
	 */
	execute(interaction, client) {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName);

			if (!command) {
				return interaction.reply({
					content: `Este comando está desactualizado. Contacta con un administrador.`,
				});
			}

			command.execute(interaction, client);
		}
	},
};
