function loadButtons(client) {
	const ascii = require('ascii-table');
	const fs = require('fs');
	const table = new ascii().setHeading('Botones', 'Status');

	const files = fs.readdirSync('./Buttons');

	for (const file of files) {
		const buttonFile = require(`../Buttons/${file}`);

		if (!buttonFile.id) return;

		client.buttons.set(buttonFile.id, buttonFile);
		table.addRow(buttonFile, '🟩');
	}

	return console.log(table.toString(), '\nBotones cargados.');
}

module.exports = { loadButtons };
