var express = require('express')
  , app = express() // Web framework to handle routing requests
  , cons = require('consolidate') // Templating library adapter for Express
  , MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  , routes = require('./routes') // Routes for our application
  , swig = require('swig') //swig to render templates
  , path = require('path');

MongoClient.connect('mongodb://localhost:27017/blog', function(err, db) {
    "use strict";
    if(err) throw err;

    // Register our templating engine
    app.engine('html', cons.swig);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    var oneDay = 86400000;

    //to host the public folder inorder to include css and js file
    app.use(express.static( __dirname + '/public', { maxAge: oneDay }));
    //app.use('/public/stylesheets', express.static(path.join(__dirname + '/public/stylesheets'), { maxAge: oneDay }));

    // Express middleware to populate 'req.cookies' so we can access cookies
    app.use(express.cookieParser());

    // Express middleware to populate 'req.body' so we can access POST variables
    app.use(express.bodyParser());

    // Application routes
    routes(app, db);

    //to render partials header and footer
    swig.init({ root: __dirname + '/views' });

    app.listen(3000);
    console.log('Express server listening on port 3000');
});
