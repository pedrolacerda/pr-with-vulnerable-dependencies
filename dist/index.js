module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(622);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 622:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(968);
const github = __webpack_require__(706);
const graphql = __webpack_require__(697)

try {
  const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
  // console.log(`Hello ${nameToGreet}!`);

  // Example on how to set an output
  //const time = (new Date()).toTimeString();
  //core.setOutput("time", time);

  // Get the JSON webhook payload for the event that triggered the workflow
//   const payload = JSON.stringify(github.context.payload, undefined, 2)
//   console.log(`The event payload: ${payload}`);

    const { vulnerability } = graphql(` query getVulnerability($ecosystem: String!, $package: String!){ 
        securityVulnerabilities(ecosystem:$ecosystem:, first:10, package:$package) {
            nodes {
                firstPatchedVersion { identifier },
                severity,
                updatedAt,
                vulnerableVersionRange
            }
        }
    }`, {
        ecosystem: "MAVEN",
        package: "com.hotels.styx:styx-api",
        headers: {
            authorization: GITHUB_TOKEN
        }
    })


    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

} catch (error) {
  core.setFailed(error.message);
}

/***/ }),

/***/ 697:
/***/ (function() {

eval("require")("@octokit/graphql");


/***/ }),

/***/ 706:
/***/ (function() {

eval("require")("@actions/github");


/***/ }),

/***/ 968:
/***/ (function() {

eval("require")("@actions/core");


/***/ })

/******/ });