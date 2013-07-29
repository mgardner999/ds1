/** Syslog parser that outputs severity counts. */

var fs = require('fs');
var severityNames = 'emergency alert critical error warning notice informational debug'.split(' ');

function parseFile(filename,callback)
{
  if (typeof filename !== 'string') throw Error('invalid filename parameter');
  if (typeof callback !== 'function') throw Error('invalid callback parameter');

  fs.readFile(filename,function(error,buffer)
  {
    if (error) return callback(error,null);

    var counts = 
    {
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

    var lines = buffer.toString().split('\n');

    for (var i=0; i<lines.length; i++)
    {
      var line = lines[i];
      if (!line || !line.length) continue; // ignore blank

      try
      {
        var result = parseLine(line);
        var severityName = severityNames[result.severity];
        counts[severityName]++;
      }
      catch (e)
      {
        counts.invalid++;
      }

      counts.total++;
    }

    callback(null,counts);
  });
}

function parseLine(line)
{
  if (typeof line !== 'string') throw Error('invalid line parameter');

  var result = {};
  result.priority = parsePriority(line);
  result.facility = Math.floor(result.priority/8);
  result.severity = result.priority - result.facility*8;
  return result;
}

function parsePriority(line)
{
  if (line[0] !== '<') throw Error('expected <');
  var priority = 0;
  var i = 1;

  while (true)
  {
    var b = line.charCodeAt(i++);

    if (b === 62)
    {
      if (i < 3) throw Error('expected digit');
      break;
    }
    else if (i === 5)
    {
      throw Error('too many digits');
    }
    else
    {
      b = b - 48; 
      if (typeof b !== 'number' || b < 0 || b > 9) throw Error('expected digit');
      priority = priority * 10 + b;
    }
  }


  if (priority > 191) throw Error('priority too large');
  return priority;
}

module.exports = 
{
  parseLine: parseLine,
  parseFile: parseFile,
  severityNames: severityNames 
};
