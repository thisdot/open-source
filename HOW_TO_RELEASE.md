# Releases

## Table of contents

- [Creating a new library](#creating-a-new-library)
- [Releasing a new version](#releasing-a-new-version)

---

## Creating a new library

When we are creating a new library in the future, there are some steps that we need to take care of in the initial PR.

**1. Make sure you use the proper generator**

If you are creating an Angular library use the Angular NX generator to generate a publishable library
If you are creating a React library use the React NX generator to generate a publishable library
Framework agnostic libraries that are only-browser should be generated by the web NX generator
NodeJS packages should be generated with the node NX generator

**2. Set up the new project.json file in your generated library folder**

We need to add some command configurations to our `project.json` file, to make them publishable by our release script. Add the `version`, `github` and `publish` targets to the `targets` configuration object. You can check the existing project.json files for reference, do not change the existing config.

```json
{
  "targets": {
    "version": {
      "executor": "@jscutlery/semver:version",
      "options": {
        "preset": "conventional",
        "tagPrefix": "${projectName}-v"
      }
    },
    "github": {
      "executor": "@jscutlery/semver:github",
      "options": {
        "tag": "${tag}",
        "notes": "${notes}"
      }
    },
    "publish": {
      "executor": "ngx-deploy-npm:deploy",
      "options": {
        "access": "public"
      }
    }
  }
}
```

**3. Add the new library to the GitHub workflow**

The `.github/workflows/release.yml` file contains our workflow for releasing new versions. Adjust the `target_projects` config's `options` array and add the name of your newly created library.

```yml
on:
  workflow_dispatch:
    inputs:
      target_project:
        type: 'choice'
        description: 'The target project to release.'
        required: true
        options:
          - utils
          - ng-utils
          - route-config
          - cypress-indexeddb
          - rxidb
          - your-new-library
# ...
```

## Releasing a new version of a library

Please make sure you follow the process of releasing new versions.

1. Make sure the `package.json` of the to-be-released library contains the version from you would like to release a new version
2. Open the repository in GitHub and go to the `Actions` tab.
3. Select the `Release NPM packages` workflow
4. This workflow can only be started manually. Click on `Run workflow`
5. DO NOT change the branch from `main`, we don't intend to use this workflow from other branches.
6. Select the target project you want to release from the dropdown
7. Select how the version number should be increased from the previously published version
   1. patch version means fixes were released
   2. minor version means new features
   3. major version means breaking changes
   4. please use the versions starting with `pre` only when you talked to a repository admin about the release plan
8. run the workflow
9. If the workflow succeeds, there should be a new package released in the @this-dot npm organisation.
10. Make sure you update the `package.json` of the recently released library with the new version. Because of certain restrictions we cannot push commits to the main branch from CI
