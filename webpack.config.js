/* eslint-disable */

// inspired by:
// https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
// https://github.com/aeksco/react-typescript-web-extension-starter
// https://github.com/notlmn/browser-extension-template/blob/master/webpack.config.js

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const WebextensionPlugin = require('webpack-webextension-plugin')
const TerserPlugin = require('terser-webpack-plugin')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const { pipe, __ } = require('ramda')

const resolveCwd = pipe(process.cwd, fs.realpathSync)

const PATHS = {
  cwd: path.resolve(resolveCwd(), '.'),
  background: path.join(__dirname, 'src/background.ts'),
  backgroundTemplate: path.join(__dirname, 'public/background.html'),
  manifest: path.join(__dirname, 'manifest.json'),
  options: path.join(__dirname, 'src/options.tsx'),
  optionsTemplate: path.join(__dirname, 'public/options.html'),
  output: path.join(__dirname, 'build'),
  sidebar: path.join(__dirname, 'src/sidebar.ts'),
  sidebarCss: path.join(__dirname, 'public/sidebar.css'),
  tutorial: path.join(__dirname, 'src/tutorial.tsx'),
  tutorialTemplate: path.join(__dirname, 'public/tutorial.html'),
  src: path.join(__dirname, 'src'),
  ui: path.join(__dirname, 'src/ui.tsx'),
  uiTemplate: path.join(__dirname, 'public/ui.html'),
}

module.exports = function (webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development'
  const isEnvProduction = webpackEnv === 'production'

  return {
    mode: webpackEnv || 'development',
    bail: isEnvProduction,
    devtool: isEnvProduction ? 'source-map' : 'inline-source-map',
    devServer: {
      contentBase: PATHS.output,
      compress: true,
      port: 9000,
    },
    entry: {
      // create a build for the background page
      background: PATHS.background,
      // create a build for the settings/options page
      options: PATHS.options,
      // content script for sidebar injection
      sidebar: PATHS.sidebar,
      // tutorial page
      tutorial: PATHS.tutorial,
      // create a build for the extension ui (popup/newtab)
      ui: PATHS.ui,
    },
    output: {
      path: PATHS.output,
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: '10000',
                name: 'media/[name].[hash:8].[ext]',
              },
            },
            {
              exclude: /node_modules/,
              test: /\.tsx?$/,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                    compact: isEnvProduction,
                  },
                },
                {
                  loader: require.resolve('ts-loader'),
                },
              ],
            },
            {
              // exclude: /node_modules/,
              test: /\.css$/,
              use: [
                {
                  loader: require.resolve('style-loader'),
                },
                {
                  loader: require.resolve('css-loader'),
                  options: { importLoaders: 1, sourceMap: isEnvProduction },
                },
                // MiniCssExtractPlugin.loader
                // {
                //   loader: 'postcss-loader',
                //   options: {
                //     ident: 'postcss',
                //     sourceMap: isEnvProduction
                //   }
                // }
              ],
            },
            {
              // process all files that are not covered by previous loaders
              loader: require.resolve('file-loader'),
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.tsx', '.json'],
      alias: {
        '@src': PATHS.src,
      },
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: isEnvProduction,
            compress: isEnvProduction,
            output: {
              beautify: !isEnvProduction,
              indent_level: 2,
            },
          },
        }),
      ],
    },
    plugins: [
      // automatically reload if a missing module is newly installed
      isEnvDevelopment && new WatchMissingNodeModulesPlugin('node_modules'),
      // get additional information for errors regarding "module not found"
      new ModuleNotFoundPlugin(PATHS.cwd),
      // TODO: setup define plugin (using env.js from CRA?)
      // new webpack.DefinePlugin(env.stringified),
      new CleanWebpackPlugin({
        // prevent clean plugin from deleting manifest and html pages
        cleanStaleWebpackAssets: false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: PATHS.sidebarCss,
          },
          // copy the extension manifest
          {
            from: PATHS.manifest,
            // inject dynamic content into the manifest
            transform: function (content, path) {
              return Buffer.from(
                JSON.stringify({
                  description: process.env.npm_package_description,
                  version: process.env.npm_package_version,
                  ...JSON.parse(content.toString()),
                })
              )
            },
          },
        ],
      }),
      new WebextensionPlugin({
        vendor: process.env.BROWSER || 'chrome',
      }),
      // new MiniCssExtractPlugin({
      //   filename: 'style.css'
      // }),
      // dynamically generate the main extension ui page
      new HtmlWebpackPlugin({
        template: PATHS.uiTemplate,
        filename: 'ui.html',
        chunks: ['ui'],
      }),
      // dynamically generate the extension options page
      new HtmlWebpackPlugin({
        template: PATHS.optionsTemplate,
        filename: 'options.html',
        chunks: ['options'],
      }),
      // dynamically generate the extension tutorial page
      new HtmlWebpackPlugin({
        template: PATHS.tutorialTemplate,
        filename: 'tutorial.html',
        chunks: ['tutorial'],
      }),
      // ensure that webpack always writes files (for dev-server)
      new WriteFilePlugin(),
    ].filter(Boolean),
  }
}
