/**
* Module dependencies.
*/

var api = require('./routes/api');
var entries = require('./routes/entries');
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var register = require('./routes/register');
var messages = require('./lib/messages');
var login = require('./routes/login');
var user = require('./lib/middleware/user');
var validate = require('./lib/middleware/validate');
var page = require('./lib/middleware/page');
var Entry = require('./lib/entry');

var app = express();

var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var basicAuth = require('basic-auth');
var serveStatic = require('serve-static');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(logger(':method :url'));
app.use(methodOverride('_method'));
app.use(cookieParser('my secret here'));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'shhhh, very secret'
}));

app.use(serveStatic(path.join(__dirname, 'public')));

app.use('/api', api.auth);
app.use(user);
app.use(messages);

app.get('/register', register.form);
app.post('/register', register.submit);
app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout', login.logout);
app.get('/post', entries.form);
app.post(
	'/post',
	validate.required('entry[title]'),
	validate.lengthAbove('entry[title]', 4),
	entries.submit
);
app.get('/api/user/:id', api.user);
app.post('/api/entry', entries.submit);
app.get('/api/entries/:page?', page(Entry.count), api.entries);
app.get('/:page?', page(Entry.count, 5), entries.list);

if (process.env.ERROR_ROUTE) {
	app.get('/dev/error', function(req, res, next){
		var err = new Error('database connection failed');
		err.type = 'database';
		next(err);
	});
}

app.use(routes.notfound);
app.use(routes.error);

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
	app.use(errorhandler());
}

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
