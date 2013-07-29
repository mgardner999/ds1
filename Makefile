BIN=./node_modules/.bin
JSCOVERAGE=./node_modules/visionmedia-jscoverage/jscoverage
MOCHA=./node_modules/mocha/bin/mocha

init:
	@mkdir -p build
	@rm -f build/*

copy:
	@cp src/* build/
	@cp test/* build/

# runs test with command-line output
test: init copy
	@$(MOCHA) -R spec build/test.js

# runs test with html code coverage output
coverage: init 
	@$(JSCOVERAGE) src build
	@cp test/* build/
	@$(MOCHA) -R html-cov build/test.js > coverage.html
