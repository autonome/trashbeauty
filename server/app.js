var express = require('express');
var multer = require('multer'),
    bodyParser = require('body-parser'),
    path = require('path');

var app = new express();
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// show upload form
app.get('/upload', function(req, res){
  res.render('index');
});

// camera viewer app
app.use('/camera', express.static('camera'));

// where photos uploads
app.use('/uploads', express.static('uploads'));

// file upload POST
app.post('/upload', multer({ dest: '../uploads/'}).single('upl'), function(req, res) {
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

app.post('/proximity', function(req, res) {
  console.log('proximity event!');
});

var port = 3000;
app.listen( port, '0.0.0.0', function(){ console.log('listening on port '+port); } );
