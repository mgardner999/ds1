#!/usr/bin/env bash

# dependencies

sudo apt-get update
sudo apt-get -y install software-properties-common python-software-properties python g++ make
sudo add-apt-repository -y ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get -y install nodejs
sudo apt-get -y install curl
sudo apt-get -y install git
                      
# code

git clone https://github.com/mgardner999/ds1.git

# install

cd ds1
npm install
