const mongoose = require('mongoose');

module.exports = mongoose.model(
	'advertencias',
	new mongoose.Schema({
		userId: String,
		guildId: String,
		moderatorId: String,
		reason: String,
		issueDate: Date,
	})
);
