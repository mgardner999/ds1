/** HTTP server accepting POST requests to /process with filename body to analyse. */

var express = require('express'),
    app = express(),
    parseFile = require('./parser').parseFile;

function start(port,callback)
{
  var instance = 
    app.use(bodyAccumulator)
       .post('/process',post)
       .listen(port,listening);

  function listening()
  {
    if (callback) callback(instance);
  }
}

function bodyAccumulator(req,res,next) 
{
  var data = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) 
  {
    data += chunk;
  });

  req.on('end', function() 
  {
    req.rawBody = data;
    next();
  });
}

function post(req,res)
{
  processFilename(req,res,req.rawBody);
}

function processFilename(req,res,filename)
{
  parseFile(filename,function(err,counts) 
  {
    if (err) res.send(500,{ status:'error', reason:err });
    else     res.send(200,{ status:'ok', counts:counts });
  });                               
}

module.exports = 
{
  start: start
};
