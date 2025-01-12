const webpack = require('@nativescript/webpack');
const { resolve } = require('path');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    // Add model aliases for better imports
    config.resolve.alias
      .set('@models', resolve(__dirname, 'app/models'))
      .set('@components', resolve(__dirname, 'app/components'));

    // Ensure proper handling of Observable
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap(options => ({
        ...options,
        allowTsInNodeModules: true,
        compilerOptions: {
          ...options.compilerOptions,
          paths: {
            "@models/*": ["app/models/*"],
            "@components/*": ["app/components/*"]
          }
        }
      }));
  });

  return webpack.resolveConfig();
};