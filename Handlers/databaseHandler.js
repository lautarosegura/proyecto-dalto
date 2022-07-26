const mongoose = require('mongoose');
const fs = require('fs');
const mongoEventFiles = fs
	.readdirSync(`./Events/Database`)
	.filter(file => file.endsWith('.js'));
require('dotenv').config();
module.exports = client => {
	client.dbLogin = () => {
		for (const file of mongoEventFiles) {
			const event = require(`../Events/Database/${file}`);
			if (event.once) {
				mongoose.connection.once(event.name, (...args) =>
					event.execute(...args, client)
				);
			} else {
				mongoose.connection.on(event.name, (...args) =>
					event.execute(...args, client)
				);
			}
		}
		mongoose.Promise = global.Promise;
		// mongoose.set('useFindAndModify', false);
		mongoose.connect(process.env.DATABASE, {
			useUnifiedTopology: true,
			useNewUrlParser: true,
		});
	};
};
