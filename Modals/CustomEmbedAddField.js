const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	EmbedBuilder,
	ModalSubmitInteraction,
	Client,
	TextInputBuilder,
} = require('discord.js');

module.exports = {
	id: 'ce-add-field-modal',
	/**
	 * @param {ModalSubmitInteraction} interaction
	 * @param {Client} client
	 */
	async execute(interaction, client) {
		const { member, guild, channel } = interaction;
		const showEmbed = interaction.message.embeds[0];
		const prevEmbed = interaction.message.embeds[1];
		const messageFirstRow = interaction.message.components[0];
		const messageSecondRow = interaction.message.components[1];
		const messageThirdRow = interaction.message.components[2];
		const firstInput = interaction.fields.getTextInputValue(
			'ce-field-name-modal-input'
		);
		const secondInput = interaction.fields.getTextInputValue(
			'ce-field-value-modal-input'
		);

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

		prevEmbed.fields.forEach(f => {
			secondPrevEmbed.addFields([
				{
					name: f.name,
					value: f.value,
				},
			]);
		});

		if (
			prevEmbed.fields.find(f => f.name.toLowerCase() === input.toLowerCase())
		) {
			interaction.reply({
				content: `¡Ya hay un campo con ese título!.`,
				ephemeral: true,
			});
		} else {
			secondPrevEmbed.addFields([
				{
					name: firstInput,
					value: secondInput,
				},
			]);

			interaction.reply({
				content: `¡Campos establecidos!`,
				ephemeral: true,
			});

			interaction.message
				.edit({
					embeds: [showEmbed, secondPrevEmbed],
					components: [messageFirstRow, messageSecondRow, messageThirdRow],
				})
				.catch(err => console.error(err.message));
		}
	},
};
