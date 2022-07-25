const {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
} = require('discord.js');

const { loadCommands } = require('../../Handlers/commandHandler');
const { loadEvents } = require('../../Handlers/eventHandler');

module.exports = {
	developer: true,
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Recarga los eventos o los comandos.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(options =>
			options.setName('eventos').setDescription('Recarga los eventos.')
		)
		.addSubcommand(options =>
			options.setName('comandos').setDescription('Recarga los comandos.')
		),
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	execute(interaction, client) {
		const Sub = interaction.options.getSubcommand();
		const action = {
			eventos: loadEvents,
			comandos: loadCommands,
		};
		action[Sub](client);
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor('Green')
					.setDescription(`Todos los ${Sub} fueron recargados.`),
			],
		});
	},
};
