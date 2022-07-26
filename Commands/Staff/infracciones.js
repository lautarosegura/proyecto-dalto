const {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
} = require('discord.js');

const moment = require('moment');
const WarnsDB = require('../../Systems/Schemas/WarnSchema.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('infracciones')
		.setDescription('Gestiona las infracciones de un usuario.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addSubcommand(options =>
			options
				.setName('ver')
				.setDescription('Ver las infracciones de un usuario.')
				.addUserOption(option =>
					option
						.setName('usuario')
						.setDescription('Usuario objetivo.')
						.setRequired(true)
				)
		)
		.addSubcommand(options =>
			options
				.setName('remover')
				.setDescription('Remover una infracción de un usuario.')
				.addStringOption(option =>
					option
						.setName('id')
						.setDescription('ID de la infracción.')
						.setRequired(true)
						.setMinLength(10)
				)
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const { options, guild } = interaction;

		const sub = options.getSubcommand();

		if (sub === 'ver') {
			const user = options.getUser('usuario');

			const userWarnings = await WarnsDB.find({
				userId: user.id,
				guildId: guild.id,
			});

			const er = new EmbedBuilder()
				.setTitle('Infracciones de usuario')
				.setAuthor({
					name: `${user.tag}`,
					iconURL: user.displayAvatarURL({ dynamic: true }),
				})
				.setDescription(`${user} no tiene infracciones.`)
				.setColor('DarkButNotBlack');

			if (!userWarnings?.length) {
				return interaction.reply({
					embeds: [er],
				});
			}

			const embedDescription = userWarnings
				.map(warn => {
					const moderator = interaction.guild.members.cache.get(
						warn.moderatorId
					);
					const unixDate = moment(warn.issueDate).unix();
					return [
						`ID de infracción: ${warn.id}`,
						`Moderador: ${moderator || 'No encontrado.'}`,
						`Razón: ${warn.reason}`,
						`Emitida: <t:${parseInt(unixDate)}:R>`,
					].join('\n');
				})
				.join('\n\n');

			const embed = new EmbedBuilder()
				.setTitle(`Infracciones de ${user.tag}`)
				.setDescription(embedDescription)
				.setColor('Aqua');

			return interaction.reply({ embeds: [embed] });
		}
		if (sub === 'remover') {
			const warnId = options.getString('id');

			const data = await WarnsDB.findById(warnId);

			const er = new EmbedBuilder()
				.setDescription(`No se encontró ninguna advertencia con ese ID.`)
				.setColor('DarkButNotBlack');
			if (!data) {
				return interaction.reply({ embeds: [er] });
			}

			await data.delete();

			const embed = new EmbedBuilder()
				.setTitle('Infracción removida')
				.setAuthor({
					name: `${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
				})
				.setColor('DarkButNotBlack')
				.setDescription(
					`La infracción con ID \`${warnId}\` fue removida con éxito.`
				)
				.setFooter({ text: `User ID: ${data.userId}` });

			return interaction.reply({ embeds: [embed] });
		}
	},
};
