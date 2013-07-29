#!/usr/bin/env bash

echo -e "\n### run unit tests"
make test

echo -e "\n### generate coverage.html"
make coverage
cd src

echo -e "\n### generate random.log"
nodejs write

echo -e "\n### process random.log by name"
nodejs command ../random.log

echo -e "\n### process random.log by pipe"
cat ../random.log | nodejs pipe

echo -e "\n### starting server daemon"
nodejs serverd 8080
sleep 1

echo -e "\n### process random.log by POST"
cd ..
curl --data "${PWD}/random.log" http://localhost:8080/process
sleep 1

echo -e "\n### process wrong.log by POST"
curl --data "/wrong.log" http://localhost:8080/process
sleep 1

echo -e "\n### stopping server daemon"
cat src/serverd.pid | xargs kill
