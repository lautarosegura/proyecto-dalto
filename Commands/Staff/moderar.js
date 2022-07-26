const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('moderar')
		.setDescription('Ejecuta acciones de moderación sobre un miembro.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption(option =>
			option
				.setName('miembro')
				.setDescription('Miembro objetivo.')
				.setRequired(true)
		),
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction, client) {
		const { options, guild, member } = interaction;
		const target = options.getMember('miembro');
		if (member.roles.highest.position < target.roles.highest.position) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setDescription(
							'\\❌ Error: no podés ejecutar acciones de moderación sobre un superior.'
						),
				],
				ephemeral: true,
			});
		}

		if (interaction.user.id === target.id) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor('Red')
						.setDescription(
							'\\❌ Error: no podés ejecutar acciones de moderación sobre vos mismo.'
						),
				],
				ephemeral: true,
			});
		}

		let banModal = generateBanModal(target.user.tag);
		let kickModal = generateKickModal(target.user.tag);
		let timeoutModal = generateTimeoutModal(target.user.tag);

		const messageToSend = generateMessage(target, guild);
		const sentMessage = await interaction.reply(messageToSend);

		const collector = sentMessage.createMessageComponentCollector({
			componentType: 'BUTTON',
			time: 60000,
		});

		collector.on('collect', i => {
			if (i.user.id !== interaction.user.id) {
				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('Red')
							.setDescription('¡No sos el dueño de esta interacción!.'),
					],
					ephemeral: true,
				});
			}

			if (i.customId === 'moderate-ban') {
				handleBanModal(interaction, banModal, target);
			}
		});
	},
};

function handleBanModal(interaction, banModal, target) {
	interaction.showModal(banModal);
	interaction.awaitModalSubmit({ time: 60000 }).then(res => {
		let duration = res.fields
			.getTextInputValue('ban-message-delete-days')
			.toLowerCase();
		const formats = ['7 dias', '1 dia', 'cero', '24 horas'];
		if (!formats.includes(duration)) {
			return res.reply({
				content: `La duración introducida no es válida.`,
				ephemeral: true,
			});
		}
		if (!res.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return res.reply({
				content: `No tenés permisos para banear usuarios.`,
				ephemeral: true,
			});
		}

		let reason =
			res.fields.getTextInputValue('ban-reason') || 'No especificada.';

		const parsedDuration = Number(
			duration
				.replace(' days', '')
				.replace(' day', '')
				.replace('none', '0')
				.replace('24 horas', '1')
		);

		target
			.ban({
				banMessageDeleteDays: parsedDuration,
				reason,
			})
			.then(() => {
				res.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('DarkButNotBlack')
							.setTitle('Nuevo ban')
							.setAuthor({
								name: target.user.tag,
								iconURL: target.displayAvatarURL({ dynamic: true }),
							})
							.setFooter({
								name: `Baneado por ${res.user.tag}`,
								iconURL: res.user.displayAvatarURL({ dynamic: true }),
							})
							.setDescription(`${target} (\`${target.user.tag}\`) fue baneado.`)
							.addFields([
								{
									name: 'Razón',
									value: reason,
									inline: false,
								},
							]),
					],
				});
			});
	});
}

function generateMessage(target, guild) {
	let buttonsRow = generateButtonsRow(target);

	const embed = new EmbedBuilder()
		.setColor('DarkButNotBlack')
		.setDescription(
			`
			Usuario: ${target} (\`${target.user.tag}\`)
			ID: \`${target.id}\`
			Creado: <t:${parseInt(target.user.createdTimestamp / 1000)}:R>
			¿Baneable?: ${target.bannaable ? 'Sí' : 'No'}
			¿Kickeable?: ${target.kickable ? 'Sí' : 'No'}
			¿Moderable?: ${target.moderatable ? 'Sí' : 'No'}
			¿Modificable?: ${target.manageable ? 'Sí' : 'No'}
			`
		)
		.setAuthor({
			name: target.user.tag,
			iconURL: target.user.displayAvatarURL({ dynamic: true }),
		})
		.setFooter({
			name: guild.name,
			iconURL: guild.iconURL({ dynamic: true }),
		});

	return {
		embeds: [embed],
		components: [buttonsRow],
		content: `ID: ${target.user.id}`,
		fetchReply: true,
	};
}

function generateButtonsRow(target) {
	const Actions = new ActionRowBuilder();
	target.bannable
		? Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-ban')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Ban')
		  )
		: Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-ban')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Ban')
					.setDisabled(true)
		  );
	target.kickable
		? Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-kick')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Kick')
		  )
		: Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-kick')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Kick')
					.setDisabled(true)
		  );

	target.moderatable
		? Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-timeout')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Timeout')
		  )
		: Actions.addComponents(
				new ButtonBuilder()
					.setCustomId('moderate-timeout')
					.setStyle(ButtonStyle.Danger)
					.setLabel('Timeout')
					.setDisabled(true)
		  );

	return Actions;
}

function generateBanModal(target) {
	let banModal = new ModalBuilder()
		.setTitle(`Ban - ${target}`)
		.setCustomId('modal-ban');

	const banMessageDeleteDays = new TextInputBuilder()
		.setCustomId('ban-message-delete-days')
		.setLabel('¿Cuántos días de mensajes deseas borrar?')
		.setPlaceholder('24 horas, 7 dias, cero')
		.setRequired(true)
		.setStyle('Short');

	const banReason = new TextInputBuilder()
		.setCustomId('ban-reason')
		.setLabel('¿Por qué estás baneando al usuario? Introduce una razón.')
		.setStyle('Paragraph')
		.setRequired(false);

	banModal.addComponents(
		new ActionRowBuilder().addComponents(banMessageDeleteDays),
		new ActionRowBuilder().addComponents(banReason)
	);

	return banModal;
}

function generateKickModal(target) {
	let kickModal = new ModalBuilder()
		.setTitle(`Kick - ${target}`)
		.setCustomId(`modal-kick`);

	const kickReason = new TextInputBuilder()
		.setCustomId('kick-reason')
		.setLabel('¿Por qué estás expulsando al usuario? Introduce una razón.')
		.setStyle('Paragraph')
		.setRequired(false);

	kickModal.addComponents(new ActionRowBuilder().addComponents(kickReason));

	return kickModal;
}

function generateTimeoutModal(target) {
	let timeoutModal = new ModalBuilder()
		.setTitle(`Timeout - ${target}`)
		.setCustomId(`modal-timeout`);

	const timeoutDuration = new TextInputBuilder()
		.setCustomId('timeout-duration')
		.setLabel('Ingresa una duración.')
		.setPlaceholder('1m, 1h, 1d')
		.setRequired(true)
		.setStyle('Short');

	const timeoutReason = new TextInputBuilder()
		.setCustomId('timeout-reason')
		.setLabel('¿Por qué estás aislando al usuario? Introduce una razón.')
		.setStyle('Paragraph')
		.setRequired(false);

	timeoutModal.addComponents(
		new ActionRowBuilder().addComponents(timeoutDuration),
		new ActionRowBuilder().addComponents(timeoutReason)
	);

	return timeoutModal;
}
