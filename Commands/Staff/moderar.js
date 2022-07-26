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
	ComponentType,
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
			componentType: ComponentType.Button,
			time: 60000,
		});

		collector.on('collect', i => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					embeds: [
						new EmbedBuilder()
							.setColor('Red')
							.setDescription('¡No sos el dueño de esta interacción!.'),
					],
					ephemeral: true,
				});
			}

			if (i.customId === 'moderate-ban') {
				handleBanModal(i, banModal, target);
			} else if (i.customId === 'moderate-kick') {
				handleKickModal(i, kickModal, target);
			} else if (i.customId === 'moderate-timeout') {
				handleTimeoutModal(i, timeoutModal, target);
			}
		});

		collector.on('end', () => {
			let Actions = generateButtonsRow(target);
			Actions.components[0].setDisabled(true);
			Actions.components[1].setDisabled(true);
			Actions.components[2].setDisabled(true);

			sentMessage.edit({
				content: `Timed out, ejecuta el comando nuevamente.`,
				components: [Actions],
			});
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
								name: `${target.user.tag}`,
								iconURL: `${target.displayAvatarURL({ dynamic: true })}`,
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

function handleKickModal(interaction, kickModal, target) {
	interaction.showModal(kickModal);
	interaction.awaitModalSubmit({ time: 60000 }).then(res => {
		let reason =
			res.fields.getTextInputValue('kick-reason') || 'Sin especificar.';
		if (!res.member.permissions.has(PermissionFlagsBits.KickMembers)) {
			return res.reply({
				content: `No tenés permisos para expulsar usuarios.`,
				ephemeral: true,
			});
		}

		target.kick(`${reason} - ${interaction.user.tag}`);
		res.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Nuevo kick')
					.setAuthor({
						name: `${target.user.tag}`,
						iconURL: target.displayAvatarURL({ dynamic: true }),
					})
					.setColor('DarkButNotBlack')
					.setDescription(`${target} (\`${target.user.tag}\`) fue expulsado.`)
					.addFields([
						{
							name: 'Razón:',
							reason,
							inline: false,
						},
					]),
			],
		});
	});
}

function handleTimeoutModal(interaction, timeoutModal, target) {
	interaction.showModal(timeoutModal);
	i.awaitModalSubmit({ time: 60000 }).then(res => {
		reason =
			res.fields.getTextInputValue('timeout-reason') || 'No especificada.';
		duration = res.fields.getTextInputValue('timeout-duration');

		const msDuration = ms(duration);
		if (!msDuration) {
			return res.reply({
				content: `Ingresaste un tiempo inválido. Ejemplo: 1m, 1h, 1d`,
				ephemeral: true,
			});
		}

		target.timeout(msDuration, `${reason} - ${res.user.tag}`);
		res.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle('Nuevo timeout')
					.setAuthor({
						name: `${target.user.tag}`,
						iconURL: `${target.user.displayAvatarURL({ dynamic: true })}`,
					})
					.setColor('DarkButNotBlack')
					.setDescription(`${target} (\`${target.user.tag}\`) fue aislado.`)
					.addFields([
						{
							name: 'Razón:',
							reason,
							inline: false,
						},
					]),
			],
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
			¿Baneable?: ${target.bannable ? 'Sí' : 'No'}
			¿Kickeable?: ${target.kickable ? 'Sí' : 'No'}
			¿Moderable?: ${target.moderatable ? 'Sí' : 'No'}
			¿Modificable?: ${target.manageable ? 'Sí' : 'No'}
			`
		)
		.setAuthor({
			name: `${target.user.tag}`,
			iconURL: `${target.user.displayAvatarURL({ dynamic: true })}`,
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
		.setLabel('Introduce una razón.')
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
		.setLabel('Introduce una razón.')
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
		.setLabel('Introduce una razón.')
		.setStyle('Paragraph')
		.setRequired(false);

	timeoutModal.addComponents(
		new ActionRowBuilder().addComponents(timeoutDuration),
		new ActionRowBuilder().addComponents(timeoutReason)
	);

	return timeoutModal;
}
