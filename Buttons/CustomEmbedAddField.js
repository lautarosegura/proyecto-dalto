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
	id: 'ce-add-field',
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

		if (prevEmbed.fields.length === 25)
			return interaction.reply({
				cotnent: `¡Este embed ya cuenta con el máximo de campos permitido! (25)`,
				ephemeral: true,
			});

		const firstInputField = new TextInputBuilder()
			.setCustomId('ce-field-name-modal-input')
			.setLabel('¡Introduce aquí el nombre del campo!')
			.setMinLength(1)
			.setMaxLength(256)
			.setRequired(true)
			.setStyle('Short');
		const secondInputField = new TextInputBuilder()
			.setCustomId('ce-field-value-modal-input')
			.setLabel('¡Introduce aquí el valor del campo!')
			.setMinLength(1)
			.setMaxLength(1024)
			.setRequired(true)
			.setStyle('Short');

		const fieldNameModalInputRow = new ActionRowBuilder().addComponents(
			firstInputField
		);
		const fieldValueModalInputRow = new ActionRowBuilder().addComponents(
			secondInputField
		);

		const modal = new ModalBuilder()
			.setCustomId('ce-add-field-modal')
			.setTitle('Añadir campo')
			.addComponents(fieldNameModalInputRow, fieldValueModalInputRow);

		await interaction.showModal(modal);
	},
};
