/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');

async function copyPackageJSON() {
  try {
    await fs.copy(
      './libs/vue-route-guard/package.json',
      './dist/libs/vue-route-guard/package.json'
    );
    console.log('Copied Package.json to dist');
  } catch (err) {
    console.error(err);
  }
}

copyPackageJSON();
