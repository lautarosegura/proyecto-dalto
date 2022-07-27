const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
	ModalSubmitInteraction,
	Client,
	TextInputBuilder,
} = require('discord.js');

module.exports = {
	id: 'ce-color-modal',
	/**
	 * @param {ModalSubmitInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { member, guild, channel } = interaction;
		const showEmbed = interaction.message.embeds[0];
		const prevEmbed = EmbedBuilder.from(interaction.message.embeds[1]);
		const messageFirstRow = interaction.message.components[0];
		const messageSecondRow = interaction.message.components[1];
		const messageThirdRow = interaction.message.components[2];
		const input = interaction.fields.getTextInputValue('ce-color-modal-input');

		if (!input.match(/[0-9A-Fa-f]{6}/g)) {
			return interaction.reply({
				content: `¡Debes introducir un código de color válido!`,
				ephemeral: true,
			});
		}

		interaction.reply({
			content: `¡Color establecido!`,
			ephemeral: true,
		});

		interaction.message
			.edit({
				embeds: [showEmbed, prevEmbed.setColor(`${input}`)],
				components: [messageFirstRow, messageSecondRow, messageThirdRow],
			})
			.catch(err => console.error(err.message));
	},
};
