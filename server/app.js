var externalIP = '10.0.0.235',
    httpPort = 3000,
    wsPort = 8001;

var express = require('express'),
    multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    ws = require('nodejs-websocket');

var app = new express();
app.disable('etag');
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
    //callback(null, file.originalname);
    callback(null, 'file-' + Date.now() + '-' + file.originalname + '.jpg');
  }
});
var upload = multer({ storage : storage}).single('upl');

// file upload POST
app.post('/upload', upload, function(req, res) {
  console.log('file upload!')
  //console.log(req.body); // form fields
  /*
  example output:

  { title: 'abc' }
  */

  //console.log(req.file); //form files
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
  var msg = JSON.parse(JSON.stringify(req.body));
  console.log('event type', msg.proximity);
  broadcast({
    photoMode: msg.proximity
  });
});

// delete
app.post('/delete', function(req, res) {
  console.log('delete!');
  console.log(req.body)
  var msg = JSON.parse(JSON.stringify(req.body));
  console.log('file to delete', msg.file);
  // TODO: FUUUUUUUUUUU
  fs.unlink('../uploads/' + msg.file)
});

// show photo list 
app.get('/photos', function(req, res){
  fs.readdir('../uploads', function(err, files){
    files = files.filter(function(file) {
      return file[0] != '.';
    }).reverse();
    //var randomfile=Math.round((Math.random() * files.length));
    //console.log(randomfile);
    //console.log (files[randomfile]);
    res.render('photos',{ files: files });
  })
});

// listen for localhost and external addr
app.listen(httpPort, '0.0.0.0', function() {
  console.log('listening on port ' + httpPort);
});


var screens = null,
    cameras = [];

// websocket server
// TODO: for some reason it doesn't like 0.0.0.0 for all interfaces
// like it should, so IP is hard coded here.
var server = ws.createServer(function(conn) {
  console.log('new websocket connection!');

  // register screens and cameras
  conn.on('text', function(opts) {
    if (!opts.register) {
      // wtf
    }
    else if (opts.register == 'camera') {
      cameras.push(conn);
      console.log('registered a camera');
    }
    else if (opts.register == 'screen') {
      screens.push(conn);
      console.log('registered a screen');
    }
  });

  conn.on('binary', function (inStream) {
    console.log('binary event!'); 

    // Empty buffer for collecting binary data 
    var data = new Buffer(0)

    // Read chunks of binary data and add to the buffer 
    inStream.on('readable', function () {
      var newData = inStream.read()
      if (newData) {
        data = Buffer.concat([data, newData], data.length+newData.length)
      }
    });

    inStream.on('end', function () {
      console.log('Received ' + data.length + ' bytes of binary data')
      //process_my_data(data)
      fs.writeFile('../uploads/' + data.length + '.jpg', data, function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      }); 
    });
  });

}).listen(wsPort, externalIP);

function broadcast(msg) {
  console.log('broadcasting a photo request to ' + server.connections.length + ' camera(s)!')
  var str = JSON.stringify(msg)
  server.connections.forEach(function (conn) {
    conn.send(str)
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

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

