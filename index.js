/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/nunjucks/nunjucks.d.ts" />
/// <reference path="typings/morgan/morgan.d.ts" />
/// <reference path="typings/helmet/helmet.d.ts" />

const express = require('express');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const helmet = require('helmet');

const routes = require('./routes');

// configure our listening port to use the environment variable PORT or 3000 if it's not defined
const PORT = process.env.PORT || 3000;

// create our express application
const app = express();

// configure nunjucks as our rendering engine
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// configure our middleware
app.use(morgan("combined"));
app.use(helmet());

// configure our route handlers
app.use(routes.mountable());

// start the application
const server = app.listen(PORT, () => {
    console.log("listening on " + server.address());
});