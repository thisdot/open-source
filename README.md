# ThisDot

## Packages

This repository currently contains the following packages:

- [@this-dot/route-config](./libs/route-config/README.md)

## Demo

You can try out our showcase application by following the steps below

1. [Import this repository on Stackblitz](https://stackblitz.com/github/thisdot/open-source)
2. When prompted, install the packages that are missing
3. Try out the showcase application.

## Coding Standards

Consistency is important on an application such as this, where many developers will work on this product over long periods of time. Therefore, we expect all developers to adhere to a common set of coding practices and expectations. This section should be updated as the team decides on new standards.

- **Formatting** - We don't want to waste time debating tabs vs spaces. All code should be formatted using Prettier set to use the settings in the `.prettierc` file. There is a Git hook (using Husky and precise-commits) that will automatically format changed code prior to commit.
- **Style Guides** - We're following the standard [Angular Style Guide](https://angular.io/guide/styleguide). Any deviation from the style guide is an error unless an exception is written in this set of coding standards.
- **State Management** - We should use NgRx in place of "Subject-Wrapping Services". That said, local state management is not only OK, it's preferred. State should only be raised into the store when it delivers architectural value to do so. We follow the NgRx core team guidelines of event-based actions and [good action hygiene](https://www.youtube.com/watch?v=JmnsEvoy-gY)
- **Testing** - All code is expected to be thoroughly tested. Code reviews should verify that each pull request contains an adequate number and variety of test cases. We try to follow the principles of the [testing trophy](https://kentcdodds.com/blog/write-tests/). The test suites should be filled with mostly integration tests written in ways that they contain minimal mocking and only testing in ways the user would interact with the UI. Unit tests should be used where appropriate, especially to test utilities, services, and the NgRx implementation. Finally, E2E tests should be used as appropriate to ensure that core user flows through the application are functioning.
- **Developer Testing** - Developers are responsible for thoroughly testing their code prior to putting it up for review. It is NOT the responsibility of the code reviewer to execute the code and test it (though the reviewer might run the code to aid their review if they want).
- **Naming Convention** - All commits and pull request names should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specifications as it is a widely acceptable way within Angular ecosystem (e.g. `<type>(<scope>): <description>`).
- **Minimal Pull Requests** - Do not commit changes to files where there was not a new feature added or an existing feature altered. Files altered only to remove unusued imports or change formatting should not be included in pull requests. Code authors are expected to review the files in each pull request and revert files that were only incidentally changed.
- **Code Comments** - We're not following a strict code commenting pattern (like js-doc), but developer are encouraged to use comments liberally where it may aid understandability and readability of the code (esepecially for new team members). Comments that merely explain what a line of code does are not necessary. Instead, comments should indicate the intent of th author. It could mention assumptions, constraints, intent, algorithm design, etc.
- **Commit/Pull Request Comments** - Code authors are strongly recommended to communicate the reason for the code changes, the nature of the changes, and the intent of the changes in their Git commit messages (this information should also make it into PR descriptions as well). Additionally, while not strictly required, we recommend that code authors make comments in their pull requests where useful to help code reviewers understand the background/intent for some of the less obvious changes.

### Commit message convention

This project uses [commitlint](https://github.com/conventional-changelog/commitlint) and [husky v6](https://github.com/typicode/husky/tree/master#install) to lint your commit messages. The project uses the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guideline. See [@commitlint/config-conventional](https://www.npmjs.com/package/@commitlint/config-conventional) for further information on how to format your commits.
