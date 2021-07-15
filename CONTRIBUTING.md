# Contributing to This Dot Open-Source Packages

[Read and abide by the Code of Conduct](CODE_OF_CONDUCT.md)! Even if you don't read it,
it still applies to you. Ignorance is not an exemption.

Contents

- [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
  - [After your pull request is merged](#after-your-pull-request-is-merged)
- [Coding Guidelines](#coding-guidelines)
- [Commit message guidelines](#commit-message-guidelines)

---

## Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

- Search [GitHub](https://github.com/thisdot/open-source/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
- Make your changes in a new git branch:

  ```shell
  git checkout -b my-fix-branch main
  ```

- Create your patch, following [code guidelines](#coding-guidelines), and **including appropriate test cases**.
- Run the full test suite and ensure that all tests pass.
- Commit your changes using a descriptive commit message that follows our
  [commit message guidelines](#commit-message-guidelines). Adherence to these conventions
  is necessary.

  ```shell
  git commit -a
  ```

  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

- Push your branch to GitHub:

  ```shell
  git push origin my-fix-branch
  ```

- In GitHub, send a pull request to the `this-dot/open-source:main` branch.
- If we suggest changes then:

  - Make the required updates.
  - Re-run the test suites to ensure tests are still passing.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase main -i
    git push -f
    ```

  - When updating your feature branch with the requested changes, please do not overwrite the commit history, but rather contain the changes in new commits. This is for the sake of a clearer and easier review process.

That's it! Thank you for your contribution!

### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete my-fix-branch
  ```

- Check out the main branch:

  ```shell
  git checkout main -f

- Delete the local branch:

  ```shell
  git branch -D my-fix-branch
  ```

- Update your main with the latest upstream version:

  ```shell
  git pull --ff upstream main

## Coding Guidelines

Consistency is important on an application such as this, where many developers will work on this product over long periods of time. Therefore, we expect all developers to adhere to a common set of coding practices and expectations. This section should be updated as the team decides on new standards.

- **Formatting** - We don't want to waste time debating tabs vs spaces. All code should be formatted using Prettier set to use the settings in the `.prettierc` file. There is a Git hook (using Husky and precise-commits) that will automatically format changed code prior to commit.
- **Style Guides** - We're following the standard [Angular Style Guide](https://angular.io/guide/styleguide). Any deviation from the style guide is an error unless an exception is written in this set of coding standards.
- **Testing** - All code is expected to be thoroughly tested. Code reviews should verify that each pull request contains an adequate number and variety of test cases. We try to follow the principles of the [testing trophy](https://kentcdodds.com/blog/write-tests/). The test suites should be filled with mostly integration tests written in ways that they contain minimal mocking and only testing in ways the user would interact with the UI. Unit tests should be used where appropriate, especially to test utilities, services, and the NgRx implementation. Finally, E2E tests should be used as appropriate to ensure that core user flows through the application are functioning.
- **Developer Testing** - Developers are responsible for thoroughly testing their code prior to putting it up for review. It is NOT the responsibility of the code reviewer to execute the code and test it (though the reviewer might run the code to aid their review if they want).
- **Minimal Pull Requests** - Do not commit changes to files where there was not a new feature added or an existing feature altered. Files altered only to remove unusued imports or change formatting should not be included in pull requests. Code authors are expected to review the files in each pull request and revert files that were only incidentally changed.
- **Code Comments** - We're not following a strict code commenting pattern (like js-doc), but developers are encouraged to use comments liberally where it may aid understandability and readability of the code (esepecially for new contributors). Comments that merely explain what a line of code does are not necessary. Instead, comments should indicate the intent of th author. It could mention assumptions, constraints, intent, algorithm design, etc.
- **Commit/Pull Request Comments** - Code authors are strongly recommended to communicate the reason for the code changes, the nature of the changes, and the intent of the changes in their Git commit messages (this information should also make it into PR descriptions as well). Additionally, while not strictly required, we recommend that code authors make comments in their pull requests where useful to help code reviewers understand the background/intent for some of the less obvious changes.

### Commit message guidelines

This project uses [commitlint](https://github.com/conventional-changelog/commitlint) and [husky v6](https://github.com/typicode/husky/tree/master#install) to lint your commit messages. The project uses the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guideline. See [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional) for further information on how to format your commits.
