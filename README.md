# mgardner999 / ds1

## Description

Node.js syslog analysis of severity statistics.

## Installation

The root of this repository includes an install.sh script which may be placed in the root of a Vagrant configuration and included in the Vagrantfile with a line as follows:

    config.vm.provision :shell, :path => "install.sh"

This will install Node.js and other dependencies, clone the git repository and install the code. 

## Demonstration

If installed as above then inside the VM the included exercise.sh script may be executed to demonstrate the required functionality. Because of the permissions established during the install it needs to be run as root to create a new sub-directory:

    vagrant ssh
    
    cd /home/vagrant/ds1
    sudo ./exercise.sh
    
## Usage

Assuming installed as above, otherwise change paths appropriately.

### Test

Runs the unit tests showing output in the console:

    cd /home/vagrant/ds1
    make test

### Coverage

Runs the unit tests producing a coverage.html file with line coverage details:

    cd /home/vagrant/ds1
    make coverage
    
### Generate random log file output

Writes a file with random (facility/severity) syslog lines

    cd /home/vagrant/ds1/src
    nodejs write ../random.log

### Command-line with filename

Analyses a single file:

    cd /home/vagrant/ds1/src
    nodejs command ../random.log

### Command-line with pipe

Analyses piped lines until end of input, for example:

    cd /home/vagrant/ds1/src
    cat ../random.log | nodejs pipe

### HTTP server daemon

Starts an HTTP server daemon, saving the pid to serverd.pid, and accepting POST requests to the URL /process with a body that is the filename to be analysed:

    cd /home/vagrant/ds1/src
    
    # start
    nodejs serverd 8080
    
    # invoke
    curl --data "/home/vagrant/ds1/random.log" http://localhost:8080/process
    
    # stop
    cat serverd.pid | xargs kill
