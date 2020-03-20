const github = require('@actions/github');
const core = require('@actions/core');

module.exports = {
    /*
    * Get a specific vulerability
    * @params package(String):   full URI of the package 
    * @params ecosystem(String): ecosystem from the list [RUBYGEMS,NPM,PIP,MAVEN,NUGET,COMPOSER]
    */
    getVulnerability: async function (package, ecosystem) {
        let octokit = new github.GitHub(core.getInput('GITHUB_TOKEN'));
     
        let query = ` 
        query { 
            securityVulnerabilities(ecosystem:${ecosystem}, first:100, package:"${package}") {
                nodes {
                    firstPatchedVersion { identifier },
                    severity,
                    updatedAt,
                    vulnerableVersionRange
                }
            }
        }`
    
        return await octokit.graphql(query, {
            headers: {
                authorization: `token ${core.getInput('GITHUB_TOKEN')}`
            }
        });
    },
    /*
    * Get all files from a PR
    */
    getPrFiles: async function (prNumber, owner, repo) {
        let octokit = new github.GitHub(core.getInput('GITHUB_TOKEN'));
    
        let {data: files} = await octokit.pulls.listFiles({
            owner: owner,
            repo: repo,
            pull_number: prNumber
        })
    
        return files
    },

    /*
    * Get a list of languages used on the repo
    */
    getLanguageList: async function (owner, repo) {
        let octokit = new github.GitHub(core.getInput('GITHUB_TOKEN'));
    
        let {data: languageList } =  await octokit.repos.listLanguages({
            owner: owner,
            repo: repo    
        })
    
        return languageList
    },
    /*
    * Get the content of a file
    */
   getFileInCommit: async function (owner, repo, path, ref) {
        let octokit = new github.GitHub(core.getInput('GITHUB_TOKEN'));

        let {data: fileInCommity } =  await octokit.repos.getContents({
            owner: owner,
            repo: repo,
            path: path,
            ref: ref,
            mediaType: {
                format: 'raw'
            }
        })

        return fileInCommity
    }

}