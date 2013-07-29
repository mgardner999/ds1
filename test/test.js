var assert = require('assert'),
    exec = require('child_process').exec,
    parser = require('./parser'),
    server = require('./server'),
    parseLine = parser.parseLine,
    parseFile = parser.parseFile,
    port = 8080;

describe('parser', function() {

  describe('parseLine', function() {

    it('should error if invalid line parameter', function() {
      assert.throws(function(){ parseLine() }, /invalid line parameter/);
      assert.throws(function(){ parseLine(123) }, /invalid line parameter/);
    });

    it('should error if invalid priority in the line', function() {
      assert.throws(function(){ parseLine('abcdef') }, /expected </);
      assert.throws(function(){ parseLine('>abcdef') }, /expected </);
      assert.throws(function(){ parseLine('<abcdef') }, /expected digit/);
      assert.throws(function(){ parseLine('<>abcdef') }, /expected digit/);
      assert.throws(function(){ parseLine('<a>abcdef') }, /expected digit/);
      assert.throws(function(){ parseLine('<1234>abcdef') }, /too many digits/);
      assert.throws(function(){ parseLine('<192>abcdef') }, /priority too large/);
    });

    it('should decode valid priorities into facility and severity', function() {
      assert.deepEqual(parseLine('<0>abcdefg'), { priority:0, facility:0, severity:0 });
      assert.deepEqual(parseLine('<1>abcdefg'), { priority:1, facility:0, severity:1 });
      assert.deepEqual(parseLine('<7>abcdefg'), { priority:7, facility:0, severity:7 });
      assert.deepEqual(parseLine('<8>abcdefg'), { priority:8, facility:1, severity:0 });
      assert.deepEqual(parseLine('<184>abcdefg'), { priority:184, facility:23, severity:0 });
      assert.deepEqual(parseLine('<191>abcdefg'), { priority:191, facility:23, severity:7 });
    });
  });

  describe('parseFile', function() {

    it('should error if invalid filename parameter', function() {
      assert.throws(function(){ parseFile() }, /invalid filename/);
      assert.throws(function(){ parseFile(123) }, /invalid filename/);
      assert.throws(function(){ parseFile(null) }, /invalid filename/);
    });

    it('should error if invalid callback parameter', function() {
      assert.throws(function(){ parseFile('foo.log') }, /invalid callback/);
      assert.throws(function(){ parseFile('foo.log',123) }, /invalid callback/);
      assert.throws(function(){ parseFile('foo.log',null) }, /invalid callback/);
    })

    it('should error if file not found', function(done) {
      parseFile('doesNotExist.log', function(error,counts) {
        assert(error);
        done();
      });
    });

    it('should handle empty file', function(done) {
      parseFile(__dirname+'/empty.log', function(error,counts) {
        assert(!error);
        checkEmptyLog(counts);
        done();
      });
    });

    it('should parse all valid file lines', function(done) {
      parseFile(__dirname+'/valid.log', function(error,counts) {
        assert(!error);
        checkValidLog(counts);
        done();
      });
    });

    it('should handle mix of valid and invalid lines with counts not an overall error', function(done) {
      parseFile(__dirname+'/mixed.log', function(error,counts) {
        assert(!error);
        checkMixedLog(counts);
        done();
      });
    });

  });

});

describe('command', function() {
   
  it('should error and output usage if filename not passed', function(done) {
    exec('node '+__dirname+'/command', function (error, stdout, stderr) {
      assert(error);
      assert.equal(stdout,'please pass filename as first argument\n');
      assert(!stderr);
      done();
    });
  });

  it('should succeed and output error status if filename not found', function(done) {
    exec('node '+__dirname+'/command doesNotExist.log', function (error, stdout, stderr) { 
      assert(!error);
      assert(stdout);
      assert(!stderr);
      var result = JSON.parse(stdout.toString());
      assert.equal(result.status, 'error');
      assert.equal(result.reason.code, 'ENOENT');
      done();
    });
  });

  it('should succeed and output statistics if filename found', function(done) {
    exec('node '+__dirname+'/command '+__dirname+'/mixed.log', function (error, stdout, stderr) { 
      assert(!error);
      assert(stdout);
      assert(!stderr);
      var result = JSON.parse(stdout.toString());
      assert.equal(result.status, 'ok');
      checkMixedLog(result.counts);
      done();
    });
  });

});

describe('server', function() {

  describe('POST /process', function() {

    it('should succeed and output error status if no body', function(done) {
      server.start(port, function(instance) {
        exec('curl -X POST http://localhost:8080/process', function (error, stdout, stderr) {
          assert(!error);
          assert(stdout);
          var result = JSON.parse(stdout.toString());
          assert.equal(result.status, 'error');
          //assert.equal(result.reason.code, 'ENOENT');
          instance.close();
          done();
        });
      });
    });

    it('should succeed and output error status if filename not found', function(done) {
      server.start(port, function(instance) {
        exec('curl --data "'+__dirname+'/doesNotExist.log" http://localhost:8080/process', function (error, stdout, stderr) {
          assert(!error);
          assert(stdout);
          var result = JSON.parse(stdout.toString());
          assert.equal(result.status, 'error');
          assert.equal(result.reason.code, 'ENOENT');
          instance.close();
          done();
        });
      });     
    });

    it('should succeed and output statistics if filename found', function(done) {
      server.start(port, function(instance) {
        exec('curl --data "'+__dirname+'/mixed.log" http://localhost:8080/process', function (error, stdout, stderr) {
          assert(!error);
          assert(stdout);
          var result = JSON.parse(stdout.toString());
          assert.equal(result.status, 'ok');
          checkMixedLog(result.counts);
          instance.close();
          done();
        });
      });     
    });

  });

});

function checkEmptyLog(counts) {
  assert.equal(counts.total, 0);
  assert.equal(counts.invalid, 0);
  assert.equal(counts.emergency, 0);
  assert.equal(counts.alert, 0);
  assert.equal(counts.critical, 0);
  assert.equal(counts.warning, 0);
  assert.equal(counts.notice, 0);
  assert.equal(counts.informational, 0);
  assert.equal(counts.debug, 0);
}

function checkValidLog(counts) {
  assert.equal(counts.total, 50);
  assert.equal(counts.invalid, 0);
  assert.equal(counts.emergency, 8);
  assert.equal(counts.alert, 8);
  assert.equal(counts.critical, 5);
  assert.equal(counts.warning, 8);
  assert.equal(counts.notice, 7);
  assert.equal(counts.informational, 5);
  assert.equal(counts.debug, 3);
}

function checkMixedLog(counts) {
  assert.equal(counts.total, 53);
  assert.equal(counts.invalid, 3);
  assert.equal(counts.emergency, 8);
  assert.equal(counts.alert, 8);
  assert.equal(counts.critical, 5);
  assert.equal(counts.warning, 8);
  assert.equal(counts.notice, 7);
  assert.equal(counts.informational, 5);
  assert.equal(counts.debug, 3);
}
