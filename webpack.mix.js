const mix = require('laravel-mix');
const ESLintPlugin = require('eslint-webpack-plugin');

mix.js('client/src/js/app.js', 'client/dist').vue();

mix.options({
  processCssUrls: false,
});

if (!mix.inProduction()) {
  // linting
  mix.webpackConfig({
    plugins: [
      new ESLintPlugin({
        extensions: ['js', 'vue'],
        emitWarning: true,
      }),
    ],
  });

  mix.sourceMaps();
}

