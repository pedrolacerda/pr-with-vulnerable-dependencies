const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const parser = require("git-diff-parser");
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile, ecosystem) {
        
        //Breaks diff into lines for easier manipulation
        var lines = dependencyFile.split('\n');
        var listOfChangedDependencies = [];
        let domParser = new DOMParser()

        const diff = parser(dependencyFile);
        console.log

        //Checks if there's a diff for pom.xml files
        for(line in lines) {
            if(lines[line].startsWith('+++ b/') && lines[line].endsWith('pom.xml')) {
                console.log('Line['+line+'] begins the dependencies changes')
                console.log(lines[line])
                //moves to the line with diff
                line = parseInt(line)
                line += 2
                
                console.log('starting at line ['+line+']')

                //If the line doesn't start with 'diff' (which is the begining of a new file diff)
                //And the line doesn't start with '@@' (which is the diff for a new block of lines)
                //And hasn't reached the EOF (-1 line that will always be 'undefined')
                //... begin to parse
                while(!lines[line].trim().startsWith('diff') 
                        && !lines[line].trim().startsWith('@@') 
                        && line < lines.length-1){
                //If the change is NOT on the dependency version variable
                    if(lines[line].search('.version') == -1){
                        console.log('Full dependency block')

                        //If that's the line changed, bypass it
                        console.log('Primeiro caracter['+line+']: '+lines[line].trim()[0])
                        if(lines[line].trim()[0] == '-'){
                            console.log('Linha que foi removida: ['+i+']')
                            line++;
                        } else if(lines[line].trim()[0] == '+'){
                            console.log('Linha que foi adicionada: ['+i+']')
                            lines[line] = lines[line].replace('+', '')
                            // let xmlDoc = parser.parseFromString(lines[line], 'text/xml')
                            // console.log(xmlDoc) 
                        }
                        

                    //If the change is directly on the dependency declaration
                    } else {
                        console.log('Just dependency version variable['+i+']')
                        //If that's the line being added (thus, the dependency)
                        if(lines[line][0] == '+'){
                            console.log('Dependency added: '+ lines[line])
                            lines[line] = lines[line].replace('+', '')
                            let xmlDoc = parser.parseFromString(lines[line], 'text/xml')
                            console.log(xmlDoc) 
                        }
                    }
                    line++;
                }
            }
        } //termina aqui

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