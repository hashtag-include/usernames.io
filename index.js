/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/nunjucks/nunjucks.d.ts" />
/// <reference path="typings/morgan/morgan.d.ts" />
/// <reference path="typings/helmet/helmet.d.ts" />
/// <reference path="typings/serve-static/serve-static.d.ts" />
/// <reference path="typings/applicationinsights/applicationinsights.d.ts" />

const express = require('express');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
const helmet = require('helmet');
const baseball = require('baseball');
const serveStatic = require('serve-static');
const appInsights = require("applicationinsights");

const routes = require('./routes');

// configure our listening port to use the environment variable PORT or 3000 if it's not defined
const PORT = process.env.PORT || 3000;

// create our express application
let app = express();

// configure baseball to exit if runtime variables are missing
baseball.defaults({
    returnCode: -1
});

// require APPINSIGHTS_INSTRUMENTATIONKEY token to be set at runtime
// see github.com/bengreenier/baseball for more info
baseball("APPINSIGHTS_INSTRUMENTATIONKEY");

// configure app insights
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();

// configure nunjucks as our rendering engine
let env = nunjucks.configure("views", {
    autoescape: true,
    express: app
});

app.engine("html", env.render);

// configure our middleware
app.use(morgan("combined"));
app.use(helmet());
app.use(serveStatic("public"));

// configure our route handlers for the root of the site, '/'
app.use("/", routes.mountable());

// start the application
const server = app.listen(PORT, () => {
    console.log(`listening on [${server.address().address}]:${server.address().port}`);
});