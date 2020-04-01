/*
 * [TO-DO] Create Nuget parser
 */
const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile,ecosystem) {
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(dependencyFile)
        let dependencies = xmlDoc.getElementsByTagName('dependency')

        for(i = 0; i < dependencies["$$length"]; i++) {
            let package = dependencies[i]['attributes'][0].value
            let version = dependencies[i]['attributes'][1].value
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
                    if(hasVulnerabilities) core.setFailed(`There's a vulnerability in the package ${package} of the ecosystem ${ecosystem}, please update to version ${minimumVersion}`)

                }
            }).catch( error => {
                core.setFailed(error.message)
                console.log(error)
            })
        }
    }
}
