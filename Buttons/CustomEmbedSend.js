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
	id: 'ce-send',
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

		const finalChannel = guild.channels.cache.get(data.finalChannel);
		if (!finalChannel) {
			return channel.send({
				content: `¡El canal objetivo no existe o no tengo permisos suficientes para ver este canal!`,
				ephemeral: true,
			});
		}

		await finalChannel
			.send({
				embeds: [prevEmbed],
			})
			.catch(err => console.error(err.message));

		await db.deleteOne({
			messageId: interaction.message.id,
			userId: member.id,
		});

		await interaction.reply({
			content: `¡El embed fue enviado con éxito a ${finalChannel}!`,
			ephemeral: true,
		});

		await interaction.message.delete();
	},
};
