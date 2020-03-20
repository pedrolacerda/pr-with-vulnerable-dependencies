const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile,ecosystem) {

        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(dependencyFile)
        
        // // These are the two tags that add packages to the repo
        let groupIds = xmlDoc.getElementsByTagName('groupId')
        let artifactIds = xmlDoc.getElementsByTagName('artifactId')
        let artifactVersions = xmlDoc.getElementsByTagName('version')

        for(i = 0; i < groupIds["$$length"]; i++) {

            let package = `${groupIds[i]['childNodes']}:${artifactIds[i]['childNodes']}`
            let version = getVersionValue(artifactVersions[i]['childNodes'], xmlDoc)
            let hasVulnerabilities = false
            let minimumVersion = ""
            
            // Loops over the list of vulnerabilities of a package
            apiCalls.getVulnerability(package, ecosystem).then( async function(values) {
                if(typeof values !== "undefined"){
                    minimumVersion = "0.0"

                    let vulerabilities = values.securityVulnerabilities.nodes

                    vulerabilities.forEach( vulnerability => {
                        if(vulnerability.firstPatchedVersion != null && typeof vulnerability.firstPatchedVersion !== 'undefined'){
                            
                            // If the version of the package used is lower than the first patched version
                            // AND the first patched version of the package is bigger than minimun version registered so far
                            if((semver.compare(semver.valid(semver.coerce(version.toString())), semver.valid(semver.coerce(vulnerability.firstPatchedVersion.identifier.toString()))) == -1)
                            && (semver.compare(semver.valid(semver.coerce(vulnerability.firstPatchedVersion.identifier.toString())), semver.valid(semver.coerce(minimumVersion.toString()))) == 1)){
                                minimumVersion = vulnerability.firstPatchedVersion.identifier
                                hasVulnerabilities = true
                            }
                        }
                    })
                    if(hasVulnerabilities) core.setFailed(`There's a vulnerability in the package ${package}, please update to version ${minimumVersion}`)

                }
            }).catch( error => {
                core.setFailed(error.message)
                console.log(error)
            })
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