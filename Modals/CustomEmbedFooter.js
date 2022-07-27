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
	id: 'ce-footer-modal',
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
		const firstInput = interaction.fields.getTextInputValue(
			'ce-footer-text-modal-input'
		);
		const secondInput = interaction.fields.getTextInputValue(
			'ce-footer-icon-modal-input'
		);

		interaction.reply({
			content: `¡Footer establecido!`,
			ephemeral: true,
		});

		if (!secondInput.length) {
			interaction.message
				.edit({
					embeds: [showEmbed, prevEmbed.setFooter({ text: `${firstInput}` })],
					components: [messageFirstRow, messageSecondRow, messageThirdRow],
				})
				.catch(err => console.error(err.message));
		} else {
			interaction.message
				.edit({
					embeds: [
						showEmbed,
						prevEmbed.setFooter({
							text: `${firstInput}`,
							iconURL: `${secondInput}`,
						}),
					],
					components: [messageFirstRow, messageSecondRow, messageThirdRow],
				})
				.catch(err => console.error(err.message));
		}
	},
};
