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
	id: 'ce-author',
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

		const firstInputField = new TextInputBuilder()
			.setCustomId('ce-author-text-modal-input')
			.setLabel('¡Introduce aquí el texto!')
			.setMinLength(1)
			.setMaxLength(2048)
			.setRequired(true)
			.setStyle('Short');

		const secondInputField = new TextInputBuilder()
			.setCustomId('ce-author-icon-modal-input')
			.setLabel('¡Introduce el URL del ícono!')
			.setMinLength(1)
			.setMaxLength(4000)
			.setRequired(false)
			.setStyle('Short');

		const authorTextModalInputRow = new ActionRowBuilder().addComponents(
			firstInputField
		);

		const authorIconModalInputRow = new ActionRowBuilder().addComponents(
			secondInputField
		);

		const modal = new ModalBuilder()
			.setCustomId('ce-author-modal')
			.setTitle('Autor')
			.addComponents(authorTextModalInputRow, authorIconModalInputRow);

		await interaction.showModal(modal);
	},
};
