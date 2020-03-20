/*
 * [TO-DO] Create Rubygems parser
 */
const core = require('@actions/core');
const semver = require('semver');
const DOMParser = require('xmldom').DOMParser;
const apiCalls = require('../api/api-calls.js')

module.exports = {
    getVulnerabilities: async function (dependencyFile,ecosystem) {
    }
}