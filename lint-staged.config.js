module.exports = {
  '*.{html,js,ts}': (_) => ['npm run format:write', 'npm run affected:lint:fix'],
  '*.{json,md,css,scss}': ['npm run format:write'],
};
