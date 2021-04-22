# ThisDot

This project was generated using [Nx](https://nx.dev).

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="450"></p>

🔎 **Powerful, Extensible Dev Tools**

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

---

## Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

[10-minute video showing all Nx features](https://nx.dev/angular/getting-started/what-is-nx)

[Interactive Tutorial](https://nx.dev/angular/tutorial/01-create-application)

## Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`
- [React](https://reactjs.org)
  - `ng add @nrwl/react`
- Web (no framework frontends)
  - `ng add @nrwl/web`
- [Nest](https://nestjs.com)
  - `ng add @nrwl/nest`
- [Express](https://expressjs.com)
  - `ng add @nrwl/express`
- [Node](https://nodejs.org)
  - `ng add @nrwl/node`

There are also many [community plugins](https://nx.dev/nx-community) you could add.

## Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@this-dot/mylib`.

## Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

## Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.

## ☁ Nx Cloud

### Computation Memoization in the Cloud

<p style="text-align: center;"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-cloud-card.png"></p>

Nx Cloud pairs with Nx in order to enable you to build and test code more rapidly, by up to 10 times. Even teams that are new to Nx can connect to Nx Cloud and start saving time instantly.

Teams using Nx gain the advantage of building full-stack applications with their preferred framework alongside Nx’s advanced code generation and project dependency graph, plus a unified experience for both frontend and backend developers.

Visit [Nx Cloud](https://nx.app/) to learn more.
