const {
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	SelectMenuBuilder,
	ModalBuilder,
	Message,
	SlashCommandBuilder,
	ChannelType,
	Client,
	Embed,
} = require('discord.js');

const db = require('../../Systems/Schemas/CustomEmbedSchema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Construye un embed personalizado.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addChannelOption(option =>
			option
				.setName('canal')
				.setDescription('Canal objetivo.')
				.setRequired(true)
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { guild, channel, member, options } = interaction;
		const targetChannel = options.getChannel('canal');

		const firstEmbed = new EmbedBuilder()
			.setTitle('Título')
			.setDescription('Descripción')
			.setFooter({ text: `Footer y foto` })
			.setAuthor({ name: `Autor y foto` })
			.addFields([
				{
					name: 'Campo',
					value: 'Valor de campo',
				},
			])
			.setColor('Grey');

		const secondEmbed = new EmbedBuilder()
			.setDescription('\u200b')
			.setColor('Grey');

		const firstRow = new ActionRowBuilder();
		firstRow.addComponents(
			new ButtonBuilder()
				.setCustomId('ce-title')
				.setLabel('Título')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-description')
				.setLabel('Descripción')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-footer')
				.setLabel('Footer')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-author')
				.setLabel('Autor')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-color')
				.setLabel('Color')
				.setStyle(ButtonStyle.Primary)
		);
		const secondRow = new ActionRowBuilder();
		secondRow.addComponents(
			new ButtonBuilder()
				.setCustomId('ce-add-field')
				.setLabel('Añadir campo')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-remove-field')
				.setLabel('Remover campo')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-thumbnail')
				.setLabel('Thumbnail')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setCustomId('ce-banner')
				.setLabel('Banner')
				.setStyle(ButtonStyle.Primary)
		);
		const thirdRow = new ActionRowBuilder();
		thirdRow.addComponents(
			new ButtonBuilder()
				.setCustomId('ce-send')
				.setLabel('Enviar')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('ce-delete')
				.setLabel('Eliminar')
				.setStyle(ButtonStyle.Danger)
		);
		await interaction.reply({
			content: `Usa este menú para generar tu embed personalizado. ¡Si no lo usas será eliminado en 10 minutos!.`,
			ephemeral: true,
		});
		const message = await interaction.channel
			.send({
				embeds: [firstEmbed, secondEmbed],
				components: [firstRow, secondRow, thirdRow],
			})
			.catch(err => console.error(err.message));

		await db
			.create({
				userId: member.id,
				messageId: message.id,
				finalChannel: targetChannel.id,
			})
			.catch(err => console.error(err.message));

		setTimeout(async function () {
			await db
				.deleteOne({ userId: member.id, messageId: message.id })
				.catch(err => {
					throw err;
				});
			if (!message.deletable) return;
			message.delete();
		}, 60 * 1000 * 10);
	},
};
