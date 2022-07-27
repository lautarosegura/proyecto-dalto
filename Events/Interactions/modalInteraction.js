const {
	ModalSubmitInteraction,
	Client,
	InteractionType,
} = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {ModalSubmitInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		if (!interaction.type === InteractionType.ModalSubmit) return;

		const modal = client.modals.get(interaction.customId);
		if (!modal) return;
		modal.execute(interaction, client);
	},
};
