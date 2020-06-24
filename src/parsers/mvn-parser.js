const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile, ecosystem) {
        if(dependencyFile.search('.version') == -1){

        } else {

        }
        //Breaks diff into lines for easier manipulation
        var lines = dependencyFile.split('\n');
        var listOfChangedDependencies = [];
        let parser = new DOMParser()

        //Checks if there's a diff for pom.xml files
        for(line in lines) {
            if(lines[line].startsWith('+++ b/') && lines[line].endsWith('pom.xml')) {
                console.log('Line['+line+'] begins the dependencies changes')
                //moves to the line with diff
                line = parseInt(line)
                line += 2
                // let getOpenTag = line.indexOf('<dependency>')
                // let getCloseTag = line.indexOf('</dependency>')
                let xmlDoc = parser.parseFromString(lines[line])
                console.log(xmlDoc)

            }
        }

    }
}

function getVersionValue(versionVariable, xmlDoc){

    var version = semver.valid(semver.coerce(versionVariable.toString()))
    //if the version value is explicit return it formated
    if(version != null && typeof version !== "undefined") {
        return version
    } else { // If the version value is a variable or null

        let versionVariableTrimmed = versionVariable.toString().replace('{','').replace('}','').replace('$','')
        let versionValue = xmlDoc.getElementsByTagName(versionVariableTrimmed)
        
        //If it's not possible to find a node with version name, return an empty string
        if(versionValue == null || typeof versionValue === "undefined" || versionValue == "")   return ""

        //otherwise, return the value of the node
        else return semver.valid(semver.coerce(versionValue[0]["childNodes"].toString()))
    }
}