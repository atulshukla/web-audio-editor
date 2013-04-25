var express = require('express');
var http = require('http');
var app = express();

// app.use(express.static(__dirname + '/public'));

// app.listen(9080);

// app.get('/', function (req, res) {
//   res.sendfile(__dirname + '/index.html');
// });

app.configure(function(){
    app.set('port', 9080);
    app.set('views', __dirname + '/app/server/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'super-duper-secret-secret' }));
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/app/public/stylus' }));
    app.use(express.static(__dirname + '/app/public'));

    app.use(express.errorHandler({dumpExceptions: true, showStack: true})); // Dump errors
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

require('./app/server/router')(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
