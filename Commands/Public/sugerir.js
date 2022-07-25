const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
	ChatInputCommandInteraction,
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sugerir')
		.setDescription('Realiza una sugerencia.')
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.addStringOption(option =>
			option
				.setName('titulo')
				.setDescription('Ingresa un breve título.')
				.setMaxLength(244)
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName('contenido')
				.setDescription('Ingresa el contenido de tu sugerencia.')
				.setRequired(true)
				.setMinLength(10)
				.setMaxLength(4096)
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction, client) {
		const { user, options, guild } = interaction;
		const titleContent = options.getString('titulo');
		const descriptionContent = options.getString('contenido');

		const embed = new EmbedBuilder()
			.setColor('#6976ff')
			.setTitle(`Sugerencia: ${titleContent}`)
			.setDescription(descriptionContent)
			.setAuthor({
				name: user.tag,
				iconURL: user.displayAvatarURL({ dynamic: true }),
			})
			.setFooter({ text: `User ID: ${user.id}` })
			.addFields([
				{
					name: 'Status',
					value: 'Pendiente',
					inline: true,
				},
				{
					name: 'Razón',
					value: 'Pendiente',
					inline: true,
				},
			])
			.setTimestamp();

		try {
			const channel = guild.channels.cache.get(process.env.SUGGESTIONS_CHANNEL);
			const message = await channel.send({ embeds: [embed], fetchReply: true });
			await message.react('👍');
			await message.react('👎');

			const confirmationEmbed = new EmbedBuilder()
				.setDescription('¡Sugerencia enviada correctamente!.')
				.setColor('Green');

			const row = new MessageActionRow();
			row.addComponents(
				new ButtonBuilder()
					.setURL(
						`https://discord.com/channels/${guild.id}/${channel.id}/${message.id}`
					)
					.setLabel('Ver sugerencia')
					.setStyle(ButtonStyle.Link)
			);

			interaction.reply({
				embeds: [confirmationEmbed],
				components: [row],
				ephemeral: true,
			});
		} catch (err) {
			console.log(err);
			const errorEmbed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('Ha ocurrido un error. Contacta con un administrador.');
			interaction.reply({ embeds: [errorEmbed] });
		}
	},
};
