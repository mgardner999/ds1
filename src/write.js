/** Writes a random (facility/severity) set of syslog lines to random.log file. */

var fs = require('fs');
var name = '../random.log';
var facility = 1; // user
var content = '';

function randomSeverity() 
{
  return Math.floor(Math.random()*8); // 0-7
}

function randomFacility() 
{
  return Math.floor(Math.random()*24); // 0-23
}

for (var i=0; i<50; i++) 
{
  var facility = randomFacility();
  var severity = randomSeverity();
  var priority = facility*8 + severity;
  var entry = '<'+priority+'>abcdefg\n';
  content += entry;

  console.log(facility, severity, priority);
}

fs.writeFile(name,content,function(error) 
{
  console.log(error ? error : 'OK');
});
