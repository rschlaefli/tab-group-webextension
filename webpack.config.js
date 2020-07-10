/* eslint-disable */

// inspired by:
// https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
// https://github.com/aeksco/react-typescript-web-extension-starter
// https://github.com/notlmn/browser-extension-template/blob/master/webpack.config.js
// https://github.com/salsita/chrome-extension-skeleton

const fs = require('fs')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const WebextensionPlugin = require('webpack-webextension-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HighlightJS = require('highlight.js')

const { pipe } = require('ramda')

const resolveCwd = pipe(process.cwd, fs.realpathSync)

const PATHS = {
  appIconBlack: path.resolve(__dirname, 'public/baseline_group_work_black_24dp.png'),
  appIconWhite: path.resolve(__dirname, 'public/baseline_group_work_white_24dp.png'),
  background: path.resolve(__dirname, 'src/background.ts'),
  changelog: path.resolve(__dirname, 'public/changelog.html'),
  cwd: path.resolve(resolveCwd(), '.'),
  data: path.resolve(__dirname, 'src/data.tsx'),
  docs: path.resolve(__dirname, 'src/docs'),
  manifest: path.resolve(__dirname, 'manifest.json'),
  options: path.resolve(__dirname, 'src/options.tsx'),
  output: path.resolve(__dirname, 'build/dev'),
  output_chrome: path.resolve(__dirname, 'build/chrome'),
  output_edge: path.resolve(__dirname, 'build/edge'),
  output_firefox: path.resolve(__dirname, 'build/firefox'),
  output_opera: path.resolve(__dirname, 'build/opera'),
  public: path.resolve(__dirname, 'public'),
  sidebar: path.resolve(__dirname, 'src/sidebar.ts'),
  sidebarToggle: path.resolve(__dirname, 'src/sidebarToggle.ts'),
  sidebarCss: path.resolve(__dirname, 'public/sidebar.css'),
  src: path.resolve(__dirname, 'src'),
  styles: path.resolve(__dirname, 'src/styles'),
  template: path.resolve(__dirname, 'public/template.html'),
  troubleshooting: path.resolve(__dirname, 'public/troubleshooting.html'),
  tutorial: path.resolve(__dirname, 'src/tutorial.tsx'),
  ui: path.resolve(__dirname, 'src/ui.tsx'),
  vendor: path.resolve(__dirname, 'node_modules'),
}

module.exports = function (webpackEnv, _) {
  const isEnvDevelopment = !webpackEnv || !webpackEnv.production
  const isEnvProduction = webpackEnv && !!webpackEnv.production

  const PACKAGE = require('./package.json')

  return {
    context: __dirname,
    mode: isEnvProduction ? 'production' : 'development',
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
      // create a build for the data page
      data: PATHS.data,
      // create a build for the settings/options page
      options: PATHS.options,
      // content script for sidebar injection
      sidebar: PATHS.sidebar,
      sidebarToggle: PATHS.sidebarToggle,
      // tutorial page
      tutorial: PATHS.tutorial,
      // create a build for the extension ui (popup/newtab)
      ui: PATHS.ui,
    },
    output: {
      path: PATHS[webpackEnv && webpackEnv.browser ? `output_${webpackEnv.browser}` : 'output'],
      filename: '[name].bundle.js',
    },
    // cache: {
    //   type: 'filesystem',
    //   buildDependencies: {
    //     config: [__filename],
    //   },
    // },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              include: PATHS.public,
              options: {
                limit: '10000',
                name: 'media/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.(js|ts)x?$/,
              include: PATHS.src,
              use: [
                {
                  loader: require.resolve('babel-loader'),
                  // options: {
                  //   // cacheDirectory: true,
                  //   // cacheCompression: false,
                  //   // compact: isEnvProduction,
                  // },
                },
              ],
            },
            {
              test: /\.css$/,
              include: [PATHS.styles, path.resolve(__dirname, 'node_modules/webext-base-css')],
              use: [
                isEnvProduction
                  ? {
                      loader: MiniCssExtractPlugin.loader,
                    }
                  : {
                      loader: require.resolve('style-loader'),
                    },
                {
                  loader: require.resolve('css-loader'),
                  options: { importLoaders: 1, sourceMap: isEnvProduction },
                },
              ],
            },
            {
              // process markdown files with syntax highlighting
              // ref: https://intoli.com/blog/webpack-markdown-setup/
              test: /\.md$/,
              include: [PATHS.docs],
              use: [
                require.resolve('html-loader'),
                {
                  loader: require.resolve('markdown-loader'),
                  options: {
                    highlight: (code, lang) => {
                      if (!lang || ['text', 'literal', 'nohighlight'].includes(lang)) {
                        return `<pre class="hljs">${code}</pre>`
                      }
                      const html = HighlightJS.highlight(lang, code).value
                      return `<span class="hljs">${html}</span>`
                    },
                  },
                },
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
      extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.md'],
      alias: {
        '@src': PATHS.src,
      },
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: isEnvProduction && [
        new TerserPlugin({
          terserOptions: {
            mangle: true,
            compress: true,
            output: {
              beautify: false,
              indent_level: 2,
            },
          },
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
      // runtimeChunk: 'single',
      // splitChunks: isEnvProduction && {
      //   cacheGroups: {
      //     vendor: {
      //       test: /[\\/]node_modules[\\/]/,
      //       name: 'vendors',
      //       chunks: 'all',
      //     },
      //   },
      // },
    },
    plugins: [
      isEnvProduction && new MiniCssExtractPlugin(),
      // fork a ts typechecker
      isEnvDevelopment && new ForkTsCheckerWebpackPlugin({ eslint: true }),
      // automatically reload if a missing module is newly installed
      isEnvDevelopment && new WatchMissingNodeModulesPlugin('node_modules'),
      // bundle analysis
      isEnvProduction && webpackEnv.analyze && new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
      // get additional information for errors regarding "module not found"
      new ModuleNotFoundPlugin(PATHS.cwd),
      // ensure that the build directories are cleaned up
      new CleanWebpackPlugin({
        // prevent clean plugin from deleting manifest and html pages
        cleanStaleWebpackAssets: false,
      }),
      // setup the webextension plugin
      new WebextensionPlugin({
        vendor: (webpackEnv && webpackEnv.browser) || 'firefox',
        manifestDefaults: {
          name: PACKAGE.name,
          version: PACKAGE.version,
          description: PACKAGE.description,
        },
      }),
      // inject the css for the sidebar
      new CopyWebpackPlugin({
        patterns: [
          { from: PATHS.sidebarCss },
          { from: PATHS.troubleshooting },
          { from: PATHS.changelog },
          { from: PATHS.appIconBlack },
          { from: PATHS.appIconWhite },
        ],
      }),
      // dynamically generate the main extension ui page
      new HtmlWebpackPlugin({
        title: 'Tab Groups',
        template: PATHS.template,
        filename: 'ui.html',
        chunks: ['ui'],
      }),
      // dynamically generate the extension options page
      new HtmlWebpackPlugin({
        title: 'Options',
        template: PATHS.template,
        filename: 'options.html',
        chunks: ['options'],
      }),
      // dynamically generate the extension tutorial page
      new HtmlWebpackPlugin({
        title: 'Tutorial',
        template: PATHS.template,
        filename: 'tutorial.html',
        chunks: ['tutorial'],
      }),
      // dynamically generate the extension data processing page
      new HtmlWebpackPlugin({
        title: 'Data Submission',
        template: PATHS.template,
        filename: 'data.html',
        chunks: ['data'],
      }),
      // ensure that webpack always writes files (for dev-server)
      // new WriteFilePlugin(),
    ].filter(Boolean),
  }
}
