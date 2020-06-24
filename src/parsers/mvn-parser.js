const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const parser = require("git-diff-parser");
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile, ecosystem) {
        
        var listOfChangedDependencies = []

        const diff = parser(dependencyFile)
        var domParser = new DOMParser()
        
        var filesChanged = diff.commits[0].files
        
        filesChanged.forEach(function(file, idx) {
            if(file.name.endsWith('pom.xml')){
                //Iterate over each line changed to get library changed
                let lines = file.lines
                for(line in lines) {
                    console.log(lines[line])

                    //If the line doesn't have a dependency version variable tag
                    //And the line has a dependency tag, then it's a full dependency block added
                    if(lines[line].text.search('.version') == -1 && lines[line].text == '<dependency>'){
                        //console.log('This is about a full dependency block that was changed')
                        // console.log(lines[line].text.search('.version'))
                        // console.log(lines[line].text.toString().trim())
                        let dependencyXML = lines[line].text
                        let xmlElement = domParser.parseFromString(lines[line].text.toString().trim(), 'text/xml')
                        console.log(xmlElement)

                    //If there's a dependency version variable tag and the line was added
                    } else if(line.type == 'added'){
                        console.log('Dependency variable added: '+line.text.toString().trim())
                    }
                }
            }
        })//ends here
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