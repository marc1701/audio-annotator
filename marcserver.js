'use strict';
const PORT = 3000;
const svr_name = 'marcserver'
const svr_ver = '1.0.0';

console.log(`${svr_name} ${svr_ver} starting...`);

const express = require('express');
const app = express();

// import filesystem module
const fs = require('fs');

app.use('/static', express.static('static'))

app.on('error', function (err) {
  console.trace('app.on-error');
  console.error(err.stack);
});

// need this...
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// this catch-all will have to do for now till fix cli post URL prob...
app.post('*', function(req, res) {
    // console.log(`POST * (${req.url})`);
    // console.log(`${req.body.annotations}`);
    var annotations = req.body.annotations;
    var n_annotations = annotations.length;
    var filename = req.body.filename;

    // get username entered from URL query parameters
    var uid = req.query.uid;

    // write annotations out to a file
    for (var i=0; i< n_annotations; i++ ) {
      fs.appendFile('annotations/' + filename + '.txt',
      `${annotations[i].annotation}` + " " + `${annotations[i].proximity}` + " " +
      `${annotations[i].start}` + " " + `${annotations[i].end}` + "\n",
      function (err) {
        if (err) throw err;
    });

    // loading the json file containing number of times previously annotated
    fs.readFile('static/json/file_annotation_n.json', function (err,data) {
    if (err) {
      return console.log(err);
    }

    // add to (or create) a file for current annotator and add annotated file to list
    fs.appendFile('static/annotators/' + uid + '.txt',
    filename + '\n', function(err){
      if (err) {
        throw err;
      } else {
      // console.log('User Record Updated.');
    }
  });



    // parse JSON to javascript object
    var json_dat = JSON.parse(data);

    // increment annotation count by 1 (tally to avoid type conversions)
    json_dat[filename] += "I";
    // console.log(json_dat[filename]);

    // write out new file list with incremented annotation count
    fs.writeFile('static/json/file_annotation_n.json', JSON.stringify(json_dat, null, 1), function(err){
      if (err){
        return console.log(err);
      } else {
        console.log('JSON Record Updated.');
      }
    });


  });
  };
  res.send("");
});


// file server section
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname } );
});

app.get('/annotation.html', function(req, res){

  var uid = req.query.uid;

  // create user record
  fs.appendFile('static/annotators/' + uid + '.txt',
  '', function(err){
    if (err) {
      throw err;
    }
  });

    res.sendFile('annotation.html', { root: __dirname } );
});

app.get('/done.html', function(req, res){
  res.sendFile('done.html', { root: __dirname } );
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(500).send('Server Error');
}

app.use(errorHandler);

app.listen(PORT, function () {
  console.log(`${svr_name} listening on ${PORT}`);
});
