# iTunes XML Parser #

## Introduction ##
This project will parse a supplied itunes library XML file and
insert the extracted information into the Apollo database.
Non-local tracks, such as Apple Music tracks, will not be included.

## Prerequisites ##

This program requires the following programs:
* Python >= 3.4
* Homebrew
* MySQL Connector (Python)
* MySQL Connector Library

Homebrew can be installed by heading to [http://brew.sh](http://brew.sh).

After homebrew installation, execute the following commands in this
project's directory to install requirements

    brew install mysql-connector-c
    pip install -r requirements.txt


## Usage ##
Supply the XML file path when calling the program, and the URL
to the database, along with the database username/password.

Example:
    
    ./itunes-xml-parser \
        "/Users/darryl/Music/iTunes/iTunes Music Library.xml" \
        "puddleglum.murrayweb.ca" "*username*" "*password*"
        
The program will return a success message, or the error messages
for the tracks that were unable to be added (Apple Music track errors
will be suppressed).