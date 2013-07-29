/** Command line entry point to syslog parser that accepts a filename argument to process. */

var filename = process.argv[2],
    parseFile = require('./parser').parseFile;

if (!filename) 
{
  console.log('please pass filename as first argument');
  process.exit(1);
}

parseFile(filename,function(err,counts) 
{
  var result = { status:err?'error':'ok', reason:err, counts:counts };
  console.log(JSON.stringify(result));
});
