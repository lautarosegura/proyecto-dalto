const emojis = [
	{ name: 'DiscordEmployee', emoji: '<:discordemployee:1001650991424344234>' },
	{
		name: 'Staff',
		emoji: '<:certifiedmoderator:1001651448267939881>',
	},
	{
		name: 'Partner',
		emoji: '<:discordpartner:1001650995484442635>',
	},
	{
		name: 'Hypesquad',
		emoji: '<:discordhypesquad:1001650992791699590>',
	},
	{
		name: 'HypeSquadOnlineHouse1',
		emoji: '<:discordbravery:1001650984390508554>',
	},
	{
		name: 'HypeSquadOnlineHouse2',
		emoji: '<:discordbrillance:1001650985564917851>',
	},
	{
		name: 'HypeSquadOnlineHouse3',
		emoji: '<:discordbalance:1001650983216107520>',
	},
	{
		name: 'BugHunterLevel1',
		emoji: '<:discordbughunterlv1:1001650987032911872>',
	},
	{
		name: 'BugHunterLevel2',
		emoji: '<:discordbughunterlv2:1001650988568027137>',
	},
	{
		name: 'VerifiedDeveloper',
		emoji: '<:badgedeveloper:1001652236880986224>',
	},
	{
		name: 'PremiumEarlySupporter',
		emoji: '<:discordearlysupporter:1001650989952155698>',
	},
];

const {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	EmbedBuilder,
} = require('discord.js');

const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Muestra la información de un usuario.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption(option =>
			option
				.setName('usuario')
				.setDescription('Usuario objetivo.')
				.setRequired(true)
		),
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const { options } = interaction;
		const user = options.getUser('usuario');
		await user.fetch();
		const userFlags = user.flags.toArray();

		let badges = [];
		emojis.forEach(e => {
			if (userFlags.includes(e.name)) {
				badges.push(e.emoji);
			}
		});

		const startMessage = new EmbedBuilder()
			.setTitle(`${user.tag}`)
			.setColor('Blurple')
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.addFields([
				{ name: 'ID:', value: `\`\`\`${user.id}\`\`\`` },
				{
					name: 'Nickname:',
					value: `\`\`\`${user.nickname || 'Ninguno'}\`\`\``,
					inline: true,
				},
				{
					name: 'Discriminador:',
					value: `\`\`\`#${user.discriminator}\`\`\``,
					inline: true,
				},
				{
					name: 'Bot:',
					value: `\`\`\`${user.bot ? 'Sí' : 'No'}\`\`\``,
					inline: false,
				},
				{
					name: 'Banner:',
					value: `${user.bannerURL() ? '```Sí```' : '```No```'}`,
					inline: false,
				},
				{
					name: 'Cuenta creada:',
					value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`,
					inline: false,
				},
			]);
		if (badges.length) startMessage.setDescription(`${badges.join(' ')}`);
		if (user.bannerURL())
			startMessage.setImage(user.bannerURL({ dynamic: true, size: 512 }));
		await interaction.reply({ embeds: [startMessage], ephemeral: false });
	},
};
