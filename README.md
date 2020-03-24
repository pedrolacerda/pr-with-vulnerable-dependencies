# Scan a PR for vulnerable dependencies
Scan commits in a PR to check if it adds a vulnerability to the dependencies of a repo

## Input
### `GITHUB_TOKEN`
Use: `${{ secrets.GITHUB_TOKEN }}`

You can see an example on how to use it in workflow in the [example-workflow.yml](https://github.com/pedrolacerda/pr-with-vulnerable-dependencies/blob/master/.github/workflows/example-workflow.yml)

### 🚨 Important
Works only when a workflow is triggered by a Pull Request

### Usage

``` yml
name: Java CI

on: [pull_request]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@master
    
    - name: Check vulnerabilities
      uses: pedrolacerda/scan-commit-for-vulnerable-dependencies@master
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
