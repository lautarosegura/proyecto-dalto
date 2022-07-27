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
	id: 'ce-description-modal',
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
		const input = interaction.fields.getTextInputValue(
			'ce-description-modal-input'
		);

		interaction.reply({
			content: `¡Descripción establecida!`,
			ephemeral: true,
		});

		interaction.message
			.edit({
				embeds: [showEmbed, prevEmbed.setDescription(`${input}`)],
				components: [messageFirstRow, messageSecondRow, messageThirdRow],
			})
			.catch(err => console.error(err.message));
	},
};
