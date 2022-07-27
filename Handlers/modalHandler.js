function loadModals(client) {
	const ascii = require('ascii-table');
	const fs = require('fs');
	const table = new ascii().setHeading('Modales', 'Status');

	const files = fs.readdirSync('./Modals');
	for (const file of files) {
		const modalFile = require(`../Modals/${file}`);

		if (!modalFile.id) return;

		client.modals.set(modalFile.id, modalFile);
		table.addRow(modalFile, '🟩');
	}

	return console.log(table.toString(), '\nModales cargados.');
}

module.exports = { loadModals };
