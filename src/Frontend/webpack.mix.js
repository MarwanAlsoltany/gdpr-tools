const mix = require('laravel-mix');
const mixPolyFill = require('laravel-mix-polyfill');

// paths
const srcPath  = './src';
const distPath = './dist';

mix.options({
  manifest: false,
  terser: {
    extractComments: false,
  },
});

mix.setPublicPath(distPath);

// compile javascript
mix.js(
  `${srcPath}/main.js`,
  'cmp-helper.js'
);

// transpile javascript
mix.polyfill({
  enabled: true,
  useBuiltIns: "entry",
  targets: "> 0.0001%"
});

if (process.env.NODE_ENV !== 'production') {
  mix.sourceMaps();
  mix.webpackConfig({
    devtool: 'inline-source-map'
  });
}
