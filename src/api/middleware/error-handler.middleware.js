const chalk = require('chalk');

const errorHandler = (error, request, response, next) => {
	console.log(chalk.red.bold(error.message));
	let handled_error = {
		statusCode: error.statusCode ? error.statusCode : 500,
		message: error.message ? error.message : 'Server Error',
	};

	response.status(handled_error.statusCode).json({
		success: false,
		error: handled_error.message,
	});
};

module.exports = errorHandler;
