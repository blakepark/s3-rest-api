var express = require('express');
var bodyParser = require('body-parser');
var raven = require('raven');
var aws = require('aws-sdk');

var app = express();

aws.config.update({ accessKeyId: process.env.ACCESSKEY || '',
                    secretAccessKey: process.env.SECRET || '' });

app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));
app.use(raven.middleware.express(process.env.SENTRY_DSN || ''));

app.get('/:region/:bucket', function(req, res){
  var region = req.params.region;
  var bucket = req.params.bucket;
  var name = req.query.name;

  aws.config.update({region: region});

  var s3 = new aws.S3();

  var params = {
    Bucket: bucket,
    Prefix: name
  }

  s3.listObjects(params, function(err, data){
    if (err) {
      res.json(err);
      return;
    }

    var contents = data.Contents;
    res.json(contents);
  });
});

app.get('/*', function(req, res){
  res.json(undefined);
});

app.put('/:region/:bucket', function(req, res){
  var region = req.params.region;
  var bucket = req.params.bucket;
  var name = req.query.name;
  var body = req.body;
  var contentType = 'application/octet-stream';
  if (name.indexOf('.torrent') > -1) contentType = 'application/x-bittorrent';
  else if (name.indexOf('.jpg') > -1) contentType = 'image/jpeg';

  aws.config.update({region: region});

  var s3 = new aws.S3();

  var params = {
    Bucket: bucket,
    Key: name,
    Body: body,
    ACL: 'public-read',
    ContentType: contentType
  };

  s3.putObject(params, function(err, data){
    if (!err) return;
    console.log(err);
  });

  res.json(undefined);
});

app.delete('/:region/:bucket', function(req, res){
  var region = req.params.region;
  var bucket = req.params.bucket;
  var name = req.query.name;

  aws.config.update({region: region});

  var s3 = new aws.S3();

  var params = {
    Bucket: bucket,
    Key: name
  };

  s3.deleteObject(params, function(err, data){
    if (!err) return;
    console.log(err);
  });

  res.json(undefined);
});

app.listen(process.env.PORT || 8888);