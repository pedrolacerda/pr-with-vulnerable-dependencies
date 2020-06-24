const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');
const apiCalls = require('./api/api-calls.js')   

// [TO-DO] Make it smarter later on
const languagesEcosystems = [
    {   language: 'Ruby',
        ecosystem: 'RUBYGEMS',
        file: 'Gemfile'
    },
    {   language: 'Javascript',
        ecosystem: 'NPM',
        file: 'package.json'
    },
    {   language: 'Python',
        ecosystem: 'PIP',
        file: 'requirements.txt'
    },
    {   language: 'Java',
        ecosystem: 'MAVEN',
        file: 'pom.xml'
    },
    {   language: 'C#',
        ecosystem: 'NUGET',
        file: '.nuspec'
    },
    {   language: 'PHP',
        ecosystem: 'COMPOSER',
        file: 'composer.json'
    }
]

try {
    let context = github.context

    // console.log(JSON.stringify(JSON.stringify(context.payload, null, 4)));
    console.log("BASE: "+context.payload.pull_request.base.ref)
    console.log("HEAD: "+context.payload.pull_request.head.ref)

    if(context.eventName == `pull_request`){
        let languagesEcosystemsInPR

        apiCalls.getLanguageList(context.payload.repository.owner.login, context.payload.repository.name).then( async languages => {

            // Checks if the PR has commits with languages in the ecosystem
            // and creates a list with them
            languagesEcosystemsInPR = languagesEcosystems.filter(language => typeof languages[language.language] !== "undefined")

        }).catch( error => {
            core.setFailed(error.message);
            }
        );

        apiCalls.getPrFiles(context.payload.number, context.payload.repository.owner.login, context.payload.repository.name)
        .then( async files => {            

            //Needs to have at least one language that GitHub scans vulnerabilities
            if(typeof languagesEcosystemsInPR !== 'undefined'){
                files.forEach( file => {

                    //Checks if dependency files were changed
                    var dependencyFileName = languagesEcosystemsInPR.find(dependencyFile => dependencyFile.file.endsWith(file.filename))

                    if(typeof dependencyFileName !== "undefined") {
                        console.log(`The dependency file ${file.filename} was changed`)
                        let ecosystem = dependencyFileName.ecosystem
                        console.log(`Ecosystem is: ${ecosystem}`)
                        var dependencyFileParser
                        switch(ecosystem) {
                            case 'RUBYGEMS':
                                dependencyFileParser = require('./parsers/rubygems-parser.js')
                                break;
                            case 'NPM':
                                dependencyFileParser = require('./parsers/npm-parser.js')
                                break;
                            case 'PIP':
                                dependencyFileParser = require('./parsers/pip-parser.js')
                                break;
                            case 'MAVEN':
                                dependencyFileParser = require('./parsers/mvn-parser.js')
                                break;  
                            case 'NUGET':
                                dependencyFileParser = require('./parsers/nuget-parser.js')
                                break;                            
                            case 'COMPOSER':
                                dependencyFileParser = require('./parsers/composer-parser.js')
                                break;
                            default:
                                core.setFailed("The ecosystem is not supported yet")
                          }

                        //Get the diff of the PR and checks if they change any depencency
                        apiCalls.compareCommitWithMain(context.payload.repository.owner.login, context.payload.repository.name, context.payload.pull_request.base.ref, context.payload.pull_request.head.ref)
                        .then( async filesDiff => {
                            await dependencyFileParser.getVulnerabilities(filesDiff,ecosystem)
                        }).catch(error => {
                            core.setFailed(error.message)
                            console.log(error)
                        });


                    }
               }) 
            } else {
                core.setFailed("We can't check for vulnerabilities for any of the languages on this repository")
            } 

        }).catch( error => {
            core.setFailed(error.message);
            console.log(error)
            }
        );
    } else {
        core.setFailed(`This action was not triggered by a Pull Request`);
    }
    
} catch (error) {
  core.setFailed(error.message);
}
