/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var app = express();
var path = require('path');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}



/**
 * Initialize moncrud-leo
 **/
require('./moncrud/moncrud.js').init(app, {	
	connection: 'mongodb://localhost/crud'
}, function (data, next) {
	next(true);
});





var routes = require('./routes');
app.get('/', routes.index);



http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
