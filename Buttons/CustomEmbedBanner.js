const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
	ButtonInteraction,
	Client,
	TextInputBuilder,
} = require('discord.js');
const db = require('../Systems/Schemas/CustomEmbedSchema');

module.exports = {
	id: 'ce-banner',
	/**
	 * @param {ButtonInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { member, guild, channel } = interaction;
		const showEmbed = interaction.message.embeds[0];
		const prevEmbed = interaction.message.embeds[1];
		const firstRow = interaction.message.components[0];
		const secondRow = interaction.message.components[1];
		const thirdRow = interaction.message.components[2];

		const data = await db.findOne({
			messageId: interaction.message.id,
			userId: member.id,
		});
		if (!data) {
			return interaction.reply({
				content: `¡Este menú no te pertenece!`,
				ephemeral: true,
			});
		}

		const inputField = new TextInputBuilder()
			.setCustomId('ce-banner-modal-input')
			.setLabel('¡Introduce aquí el URL del banner!')
			.setMinLength(1)
			.setMaxLength(4000)
			.setRequired(true)
			.setStyle('Short');

		const bannerModalInputRow = new ActionRowBuilder().addComponents(
			inputField
		);

		const modal = new ModalBuilder()
			.setCustomId('ce-banner-modal')
			.setTitle('Banner')
			.addComponents(bannerModalInputRow);

		await interaction.showModal(modal);
	},
};
