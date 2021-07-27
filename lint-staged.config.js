module.exports = {
  '*.{html,js,ts}': ['npm run format:write', 'npm run affected:lint:fix'],
  '*.{json,md,css,scss}': ['npm run format:write'],
};
