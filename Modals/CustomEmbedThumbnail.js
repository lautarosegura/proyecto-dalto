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
	id: 'ce-thumbnail-modal',
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
			'ce-thumbnail-modal-input'
		);

		if (
			input &&
			!input.match(
				/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
			)
		) {
			return interaction.reply({
				content: `¡Debés introducir una URL válida!.`,
				ephemeral: true,
			});
		}

		interaction.reply({
			content: `¡Thumbnail establecido!`,
			ephemeral: true,
		});

		interaction.message
			.edit({
				embeds: [showEmbed, prevEmbed.setThumbnail(`${input}`)],
				components: [messageFirstRow, messageSecondRow, messageThirdRow],
			})
			.catch(err => console.error(err.message));
	},
};
