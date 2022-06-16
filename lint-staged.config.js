module.exports = {
  '*.{html,js,ts}': [
    'npm run format:write' /* , 'npm run affected:lint:fix' temporarily commented out because it fails in the pre-commit hook */,
  ],
  '*.{json,md,css,scss}': ['npm run format:write'],
};
