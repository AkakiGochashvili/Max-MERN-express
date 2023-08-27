const express = require('express');
const chalk = require('chalk');
const connectMongo = require('./api/config/connect-mongo');
const dotenv = require('dotenv');
const errorHandler = require('./api/middleware/error-handler.middleware');

const app = express();

dotenv.config({ path: `${__dirname}/api/config/environment/${process.env.NODE_ENV}.env` });

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }));

app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-requested-With, Content-Type, Accept, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE');

    next();
});

app.use('/api/places', require('./api/routes/place.routes'));
app.use('/api/users', require('./api/routes/user.routes'));

app.use(errorHandler);

app.listen(process.env.PORT, (request, response) => {
    console.log(chalk.bold.yellow(`Server running in ${process.env.NODE_ENV} mode on port: ${process.env.PORT} `));

    connectMongo();
});
