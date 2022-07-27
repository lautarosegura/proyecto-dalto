const { ButtonInteraction, Client, InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {ButtonInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		if (!interaction.type === InteractionType.ButtonInteraction) return;

		const button = client.buttons.get(interaction.customId);
		if (!button) return;
		button.execute(interaction, client);
	},
};
