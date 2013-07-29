/** Command line entry point to syslog parser that accepts piped standard input. */

var parser = require('./parser'),
    parseLine = parser.parseLine,
    severityNames = parser.severityNames,
    stdin = process.openStdin(),
    data = '',
    counts = {
      invalid:0,
      total:0,
      emergency:0,
      alert:0,
      critical:0,
      error:0,
      warning:0,
      notice:0,
      informational:0,
      debug:0
    };

stdin.on('data',function(chunk)
{
  data += chunk;
  processCompleteLines();
});

stdin.on('end', function()
{
  console.log('--- END ---');
  console.log(JSON.stringify(counts));
});

function processCompleteLines()
{
  var i;
  while ((i = data.indexOf('\n')) > -1)
  {
    var line = data.substring(0,i);
    data = data.substring(i+1);

    if (!line || !line.length) continue; // ignore blank

    try
    {
      var result = parseLine(line);
      var severityName = severityNames[result.severity];
      counts[severityName]++;
      console.log(JSON.stringify(result));
    }
    catch (e)
    {
      counts.invalid++;
      console.log(e);
    }

    counts.total++;
  }
}
