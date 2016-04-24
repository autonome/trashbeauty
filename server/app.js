var express = require('express');
var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    ws = require('nodejs-websocket');

var app = new express();
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// show upload form
app.get('/upload', function(req, res){
  res.render('index');
});

// test for allowing larger files
app.use(bodyParser.urlencoded({
  extended: true,
  limit: 100000000 
}));

// static misc
app.use('/static', express.static('../static'));

// camera viewer app
app.use('/camera', express.static('../camera'));

// where photos upload to and are served from
app.use('/uploads', express.static('../uploads'));

// configure Multer
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, '../uploads');
  },
  filename: function (req, file, callback) {
    callback(null,file.originalname);
  }
});
//var upload = multer({ storage : storage}).single('userPhoto');
var upload = multer({ storage : storage}).single('upl');

// file upload POST
app.post('/upload', upload, function(req, res) {
  console.log(req.body); // form fields
  /*
  example output:

  { title: 'abc' }
  */

  console.log(req.file); //form files
  /* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
  */

  res.status(204).end();
});

// listen for proximity events from that device
app.post('/proximity', function(req, res) {
  console.log('proximity event!');
  broadcast({
    takePhoto: 'hellyes'
  });
});

// 
app.get('/photos', function(req, res){
  fs.readdir('../uploads', function(err, files){
    files = files.filter(function(file) {
      return file[0] != '.';
    });
    //var randomfile=Math.round((Math.random() * files.length));
    //console.log(randomfile);
    //console.log (files[randomfile]);
    res.render('photos',{ files: files });
  })
});

var port = 3000;
app.listen( port, '0.0.0.0', function(){ console.log('listening on port '+port); } );

// websocket server
var server = ws.createServer(function (conn) {
}).listen(8001)

function broadcast(msg) {
  server.connections.forEach(function (conn) {
    conn.send(msg)
  })
}

/*
// testing
setInterval(function() {
  broadcast(JSON.stringify({
    takePhoto: 'hellyes'
  }));
}, 5000);
*/
