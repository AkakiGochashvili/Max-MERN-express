const mongoose = require('mongoose');
const chalk = require('chalk');

const connectMongo = async () => {
	mongoose.set("strictQuery", false);
	const connected = await mongoose.connect(process.env.MONGO_URL);

	console.log(chalk.bold.cyan(`Mongo Connected: ${connected.connection.host}`));
};

module.exports = connectMongo;
