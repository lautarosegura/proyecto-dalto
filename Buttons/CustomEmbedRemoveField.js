const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
	ButtonInteraction,
	Client,
	ComponentType,
	TextInputBuilder,
} = require('discord.js');
const db = require('../Systems/Schemas/CustomEmbedSchema');

module.exports = {
	id: 'ce-remove-field',
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

		const firstEmbedRow = new ActionRowBuilder();
		const secondEmbedRow = new ActionRowBuilder();
		const thirdEmbedRow = new ActionRowBuilder();
		const fourthEmbedRow = new ActionRowBuilder();
		const fifthEmbedRow = new ActionRowBuilder();
		const sixthEmbedRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setLabel('Remover todos los campos')
				.setCustomId('ce-remove-all-fields')
				.setStyle(ButtonStyle.Danger)
		);

		if (prevEmbed.fields.length === 0)
			return interaction.reply({
				content: `¡El embed no posee ningún campo!`,
				ephemeral: true,
			});

		prevEmbed.fields.forEach(f => {
			if (firstEmbedRow.components.length !== 5) {
				firstEmbedRow.addComponents(
					new ButtonBuilder()
						.setLabel(`${f.name}`)
						.setCustomId(`${f.name}`)
						.setStyle(ButtonStyle.Primary)
				);
			} else if (secondEmbedRow.components.length !== 5) {
				secondEmbedRow.addComponents(
					new ButtonBuilder()
						.setLabel(`${f.name}`)
						.setCustomId(`${f.name}`)
						.setStyle(ButtonStyle.Primary)
				);
			} else if (thirdEmbedRow.components.length !== 5) {
				thirdEmbedRow.addComponents(
					new ButtonBuilder()
						.setLabel(`${f.name}`)
						.setCustomId(`${f.name}`)
						.setStyle(ButtonStyle.Primary)
				);
			} else if (fourthEmbedRow.components.length !== 5) {
				fourthEmbedRow.addComponents(
					new ButtonBuilder()
						.setLabel(`${f.name}`)
						.setCustomId(`${f.name}`)
						.setStyle(ButtonStyle.Primary)
				);
			} else {
				fifthEmbedRow.addComponents(
					new ButtonBuilder()
						.setLabel(`${f.name}`)
						.setCustomId(`${f.name}`)
						.setStyle(ButtonStyle.Primary)
				);
			}
		});

		if (fifthEmbedRow.components.length >= 1) {
			interaction.reply({
				components: [
					firstEmbedRow,
					secondEmbedRow,
					thirdEmbedRow,
					fourthEmbedRow,
					fifthEmbedRow,
					sixthEmbedRow,
				],
			});
		} else if (fourthEmbedRow.components.length >= 1) {
			interaction
				.reply({
					components: [
						firstEmbedRow,
						secondEmbedRow,
						thirdEmbedRow,
						fourthEmbedRow,
						sixthEmbedRow,
					],
				})
				.catch(err => console.err(err.message));
		} else if (thirdEmbedRow.components.length >= 1) {
			interaction
				.reply({
					components: [
						firstEmbedRow,
						secondEmbedRow,
						thirdEmbedRow,
						sixthEmbedRow,
					],
				})
				.catch(err => console.err(err.message));
		} else if (secondEmbedRow.components.length >= 1) {
			interaction
				.reply({
					components: [firstEmbedRow, secondEmbedRow, sixthEmbedRow],
				})
				.catch(err => console.err(err.message));
		} else {
			interaction
				.reply({
					components: [firstEmbedRow, sixthEmbedRow],
				})
				.catch(err => console.err(err.message));
		}

		const secondPrevEmbed = new EmbedBuilder();

		if (prevEmbed.title) secondPrevEmbed.setTitle(prevEmbed.title);
		if (prevEmbed.description.length)
			secondPrevEmbed.setDescription(prevEmbed.description);
		const authorObj = {};
		if (prevEmbed?.author?.iconURL)
			authorObj['iconURL'] = prevEmbed.author.iconURL;
		if (prevEmbed?.author?.name) authorObj['name'] = prevEmbed.author.name;
		if (Object.keys(authorObj).length) secondPrevEmbed.setAuthor(authorObj);
		const footerObj = {};
		if (prevEmbed?.footer?.iconURL)
			footerObj['iconURL'] = prevEmbed.footer.iconURL;
		if (prevEmbed?.footer?.text) footerObj['text'] = prevEmbed.footer.text;
		if (Object.keys(footerObj).length) secondPrevEmbed.setFooter(footerObj);
		if (prevEmbed?.thumbnail)
			secondPrevEmbed.setThumbnail(prevEmbed.thumbnail.url);
		if (prevEmbed?.image) secondPrevEmbed.setImage(prevEmbed.image.url);
		if (prevEmbed?.color) secondPrevEmbed.setColor(prevEmbed.color);

		const collector = channel.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60 * 1000 * 10 * 2,
			maxComponents: 1,
		});
		const message = channel.messages.cache.get(data.messageId);
		const messageFirstRow = message.components[0];
		const messageSecondRow = message.components[1];
		const messageThirdRow = message.components[2];
		const messageShowEmbed = message.embeds[0];
		const messagePrevEmbed = message.embeds[1];

		collector.on('collect', async b => {
			if (b.member.id !== member.id) {
				return interaction.reply({
					content: `¡Este menú no te pertenece!`,
					ephemeral: true,
				});
			}
			if (b.customId === 'ce-remove-all-fields') {
				interaction.message
					.edit({
						embeds: [showEmbed, secondPrevEmbed],
						components: [messageFirstRow, messageSecondRow, messageThirdRow],
					})
					.catch(err => console.error(err.message));
			} else {
				prevEmbed.fields.forEach(f => {
					if (f.name === b.customId) return;
					secondPrevEmbed.addFields({
						name: f.name,
						value: f.value,
					});
				});

				message
					.edit({
						embeds: [messageShowEmbed, secondPrevEmbed],
						components: [messageFirstRow, messageSecondRow, messageThirdRow],
					})
					.catch(err => console.error(err.message));

				interaction
					.editReply({
						content: `¡El campo fue eliminado con éxito!`,
						components: [],
					})
					.catch(err => console.error(err.message));
			}
		});

		collector.on('end', async b => {
			interaction.deleteReply().catch(err => console.error(err.message));
		});
	},
};
