module.exports = {
  extends: ['../../.eslintrc.json'],
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts', '*.vue'],
      extends: [
        'plugin:vue/vue3-recommended',
        'plugin:@intlify/vue-i18n/recommended',
        '@vue/typescript/recommended',
        'prettier',
      ],
      plugins: ['import'],
      parser: 'vue-eslint-parser',
      parserOptions: { ecmaVersion: 2020 },
      rules: {
        'no-unused-vars': 'off',
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'space-before-function-paren': [
          'error',
          { anonymous: 'never', named: 'never', asyncArrow: 'always' },
        ],
        'padded-blocks': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-multiple-empty-lines': ['error', { max: 1 }],
        'keyword-spacing': ['error', { after: true }],
        'max-len': ['error', { code: 100, ignorePattern: '^\\s*<path' }],
        'no-param-reassign': [2, { props: false }],
        'object-curly-newline': [
          'error',
          {
            consistent: true,
            multiline: true,
          },
        ],
        'no-extra-boolean-cast': 'error',
        'import/extensions': [
          'error',
          {
            ts: 'never',
            js: 'never',
            vue: 'always',
            json: 'always',
            png: 'always',
            jpg: 'always',
            mp3: 'always',
            mp4: 'always',
          },
        ],
        indent: ['error', 2, { SwitchCase: 0 }],
        'vue/attribute-hyphenation': ['error', 'never'],
        'vue/singleline-html-element-content-newline': [
          'error',
          {
            ignoreWhenNoAttributes: true,
            ignoreWhenEmpty: true,
          },
        ],
        'vue/max-attributes-per-line': [
          'error',
          {
            singleline: 3,
          },
        ],
        'vue/no-v-html': 'off',
        '@intlify/vue-i18n/no-v-html': 'off',
        '@intlify/vue-i18n/no-unused-keys': [
          'error',
          {
            src: './src',
            extensions: ['.js', '.vue'],
          },
        ],
        '@intlify/vue-i18n/no-raw-text': 'error',
      },
    },
  ],
};
