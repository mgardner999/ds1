/** Daemon HTTP server accepting POST requests to /process with filename body to analyse. */

var port = process.argv[2],
    server = require('./server'),
    daemon = require('daemon'),
    fs = require('fs');

if (!port)
{
  console.log('please pass port number as first argument');
  process.exit(1);
}

daemon();

server.start(port,function(instance)
{
  console.log('server listening on port',port);

  fs.writeFile('serverd.pid',process.pid,function()
  {
    process.on('SIGTERM',function()
    {
      instance.close();
      fs.unlink('server.pid');
      process.exit();
    });
  });
});
