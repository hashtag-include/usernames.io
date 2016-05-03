/// <reference path="../typings/express/express.d.ts" />

const baseball = require('baseball');
const Router = require('express').Router;

const availability = require('./availability');
const usernames = require('./usernames');

const isService = availability.isService;
const serviceExists = availability.serviceExists;
const queryAll = availability.queryAll;
const generate = usernames.generate;

// require APPINSIGHTS_INSTRUMENTATIONKEY token to be set at runtime
// see github.com/bengreenier/baseball for more info
baseball("APPINSIGHTS_INSTRUMENTATIONKEY");

// a constructor of sorts, that creates and returns a configured express router
function mountable() {
    let router = Router();
    
    // mount our main route for users
    router.get('/', (req, res) => {
        
        // generate a username
        generate().then((username) => {
            
            // we need to create our templateInjection object
            let templateInjection = {
                username: username,
                appInsightsId: process.env.APP_INSIGHTS_KEY
            };
            
            // render the results
            res.render('main.html', templateInjection);
        }).catch((err) => {
            
            // in the event of an availability error, we error out
            console.error(err);
            res.status(500).end();
        })
    });
    
    // mount our main route for the API
    router.get('/new', (req, res) => {
        
        // generate a username and get all it's availability info
        generate().then(queryAll).then((responseObject) => {
            
            // send the results
            res.send(responseObject);
        }).catch((err) => {
            
            // in the event of an availability error, we error out
            console.error(err);
            res.status(500).send(err);
        });
    });
    
    // mount our availability route
    router.get('/availability/:service', isService, (req, res) => {
        let responseObject = {};
        
        // if the querystring parameter username isn't set, we error out
        if (typeof(req.query.username) === "undefined") {
            console.error("missing query username");
            return res.status(400).end();
        }
        
        // check if the username exists for the given service
        serviceExists(req.params.service, req.query.username).then((exists) => {
            
            // format our response object
            responseObject[req.params.service] = exists;
            
            // respond to the request
            res.send(responseObject);
        }).catch((err) => {
            
            // in the event of an availability error, we error out
            console.error(err);
            res.status(500).end();
        })
    });
    
    // the mountable function returns the configured Router instance we created
    return router;
}

// export our behavior
module.exports = exports = {
    mountable : mountable
};