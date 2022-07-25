const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	Client,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	PermissionFlagsBits,
} = require('discord.js');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sugerencia')
		.setDescription('Administra una sugerencia.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addSubcommand(options =>
			options
				.setName('aceptar')
				.setDescription('Acepta una sugerencia.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('Ingresa un ID de mensaje.')
						.setRequired(true)
						.setMinLength(18)
				)
				.addStringOption(option =>
					option
						.setName('razon')
						.setDescription('Ingresa una razón.')
						.setMaxLength(1024)
						.setRequired(true)
				)
		)
		.addSubcommand(options =>
			options
				.setName('rechazar')
				.setDescription('Rechaza una sugerencia.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('Ingresa un ID de mensaje.')
						.setRequired(true)
						.setMinLength(18)
				)
				.addStringOption(option =>
					option
						.setName('razón')
						.setDescription('Ingresa una razón')
						.setRequired(true)
						.setMaxLength(1024)
				)
		)
		.addSubcommand(options =>
			options
				.setName('implementar')
				.setDescription('Marca una sugerencia como implementada.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('Ingresa un ID de mensaje.')
						.setRequired(true)
						.setMinLength(18)
				)
				.addStringOption(option =>
					option
						.setName('comentario')
						.setDescription(
							'Cualquier comentario adicional que quisieras añadir.'
						)
						.setMaxLength(1024)
				)
		),
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { options, guild } = interaction;
		const messageId = options.getString('id');
		const reason = options.getString('reason') || 'Sin especificar.';
		const comment =
			options.getString('comentario') || 'Sin información adicional.';
		const embed = new EmbedBuilder();

		const suggestionChannel = guild.channels.cache.get(
			process.env.SUGGESTIONS_CHANNEL
		);
		const suggestionMessage = await suggestionChannel.messages.fetch(messageId);
		const data = suggestionMessage.embeds[0];
		const channel = client.channels.cache.get(
			process.env.SUGGESTIONS_UPDATE_CHANNEL
		);

		const user = await client.users.cache.find(u => u.tag === data.author.name);

		const row = new ActionRowBuilder();
		row.addComponents(
			new ButtonBuilder()
				.setURL(
					`https://discord.com/channels/${guild.id}/${suggestionChannel.id}/${messageId}`
				)
				.setLabel('Ver sugerencia')
				.setStyle(ButtonStyle.Link)
		);

		const Sub = options.getSubcommand();

		if (Sub === 'aceptar') {
			try {
				const acceptEmbed = new EmbedBuilder()
					.setColor('Green')
					.setTitle(data.title)
					.setAuthor({ name: data.author.name, iconURL: data.author.iconURL })
					.setDescription(data.description)
					.setFooter({ text: `Aceptada por ${interaction.user.tag}` })
					.setTimestamp()
					.addFields([
						{
							name: 'Status',
							value: 'Aceptada',
							inline: true,
						},
						{
							name: 'Razón',
							value: reason,
							inline: true,
						},
					]);

				await suggestionMessage.edit({ embeds: [acceptEmbed] });
				embed.setColor('Green').setDescription('¡La sugerencia fue aceptada!');
				interaction.reply({ embeds: [embed], ephemeral: true });

				const notifyAcceptEmbed = new EmbedBuilder()
					.setAuthor({
						name: `Sugerencia aceptada`,
						iconURL: `https://postimg.cc/4HcNgf7d`,
					})
					.setColor('Green')
					.setTitle(data.title)
					.setDescription(data.description)
					.addFields([
						{
							name: 'Moderador',
							value: interaction.user.tag,
							inline: true,
						},
						{
							name: 'Razon',
							value: reason,
							inline: true,
						},
					]);
				await channel.send({
					content: `${user} | ¡Tu sugerencia fue aceptada!`,
					embeds: [notifyAcceptEmbed],
					components: [row],
				});
			} catch (err) {
				console.log(err);
				const errEmbed = new EmbedBuilder()
					.setColor('Red')
					.setDescription(
						'Ocurrió un error al intentar ejecutar este comando. Contacta con un administrador.'
					);
				interaction.reply({ embeds: [errEmbed], ephemeral: true });
			}
		} else if (Sub === 'rechazar') {
			try {
				const declineEmbed = new EmbedBuilder()
					.setColor('Red')
					.setTitle(data.title)
					.setAuthor({
						name: `${data.author.name}`,
						iconURL: `${data.author.iconURL}`,
					})
					.setDescription(data.description)
					.setFooter({ text: `Rechazada por ${interaction.user.tag}` })
					.setTimestamp()
					.addFields(
						{ name: 'Status', value: `Rechazada`, inline: true },
						{ name: 'Razon', value: reason, inline: true }
					);
				await suggestionMessage.edit({ embeds: [declineEmbed] });
				embed.setColor('Red').setDescription('¡Sugerencia rechazada!');
				interaction.reply({ embeds: [embed], ephemeral: true });

				const notifyDeclineEmbed = new EmbedBuilder()
					.setAuthor({
						name: `Sugerencia rechazada`,
						iconURL: `https://i.postimg.cc/QCTLJy30/9636-Cross.png`,
					})
					.setColor('Red')
					.setTitle(data.title)
					.setDescription(data.description)
					.addFields([
						{
							name: 'Moderador',
							value: interaction.user.tag,
							inline: true,
						},
						{
							name: 'Razón',
							value: reason,
							inline: true,
						},
					]);

				await channel.send({
					content: `${user} | ¡Tu sugerencia fue rechazada!`,
					embeds: [notifyDeclineEmbed],
					components: [row],
					fetchReply: true,
				});
			} catch (err) {
				console.log(err);
				const errEmbed = new EmbedBuilder()
					.setColor('Red')
					.setDescription(
						'Ocurrió un error al intentar ejecutar este comando. Contacta con un administrador.'
					);
				interaction.reply({ embeds: [errEmbed], ephemeral: true });
			}
		} else if (Sub === 'implementar') {
			try {
				const implementedEmbed = new MessageEmbed()
					.setColor('YELLOW')
					.setTitle(data.title)
					.setAuthor({
						name: `${data.author.name}`,
						iconURL: `${data.author.iconURL}`,
					})
					.setDescription(data.description)
					.setFooter({ text: `Anunciado por ${interaction.user.tag}` })
					.setTimestamp()
					.addFields(
						{ name: 'Status', value: `Implementada`, inline: true },
						{ name: 'Comentario adicional', value: comment, inline: true }
					);
				await suggestionMessage.edit({ embeds: [implementedEmbed] });
				embed.setColor('GREEN').setDescription(`¡Implementación anunciada!`);
				interaction.reply({ embeds: [Embed], ephemeral: true });

				const notifyImplementedEmbed = new EmbedBuilder()
					.setAuthor({
						name: 'Sugerencia implementada',
						iconURL: 'https://i.postimg.cc/prG9KyPD/2942-Check.png',
					})
					.setColor('Yellow')
					.setTitle(data.title)
					.setDescription(data.description)
					.addFields(
						{
							name: 'Moderador',
							value: `${interaction.user.tag}`,
							inline: true,
						},
						{ name: 'Comentario adicional', value: Comment, inline: true }
					);

				await channel.send({
					content: `${user} | ¡Tu sugerencia fue implementada!`,
					embeds: [notifyImplementedEmbed],
					components: [row],
					fetchReply: true,
				});
			} catch (err) {
				console.log(err);
				const errEmbed = new MessageEmbed()
					.setColor('Red')
					.setDescription(
						`Ocurrió un error al intentar ejecutar este comando. Contacta con un administrador.`
					);
				interaction.reply({ embeds: [errEmbed], ephemeral: true });
			}
		}
	},
};
