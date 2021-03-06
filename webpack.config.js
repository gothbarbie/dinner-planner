const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const autoprefixer = require('autoprefixer')

module.exports = env => {
  const isDevelopment = env.mode === 'development'
  const isProduction = env.mode === 'production'

  const CSSModuleLoader = {
    loader: 'css-loader',
    options: {
      modules: true,
      sourceMap: true,
      localIdentName: isProduction
        ? '[hash:base64:5]'
        : '[local]__[hash:base64:5]',
    },
  }

  const CSSLoader = {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: true,
    },
  }

  const postCSSLoader = {
    loader: 'postcss-loader',
    options: {
      ident: 'postcss',
      sourceMap: true,
      plugins: () => [
        autoprefixer({
          browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
        }),
      ],
    },
  }

  return {
    devServer: {
      contentBase: path.resolve(__dirname, 'dist'),
      watchContentBase: true,
      publicPath: '/',
      hot: isDevelopment,
      historyApiFallback: true,
    },
    devtool: isDevelopment ? 'inline-source-map' : false,
    entry: [
      path.resolve(__dirname, './polyfills'),
      path.resolve(__dirname, 'src/index.js'),
    ],
    output: {
      path: isProduction ? path.resolve(__dirname, 'dist') : undefined,
      // publicPath: '/',
      filename: isDevelopment
        ? 'static/js/bundle.js'
        : 'static/js/[name].[hash:8].js',
      chunkFilename: isDevelopment
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[hash:8].chunk.js',
    },
    optimization: {
      minimize: isDevelopment,
      minimizer: isProduction
        ? [
            new TerserPlugin({
              terserOptions: {
                parse: { ecma: 8 },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
              parallel: true,
              cache: true,
              sourceMap: isDevelopment,
            }),
          ]
        : [],
      // splitChunks: {
      //   chunks: 'all',
      //   name: false,
      // },
      // runtimeChunk: true,
    },
    resolve: {
      modules: [path.resolve(__dirname, './src'), 'node_modules'],
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        reducers: path.resolve(__dirname, './src/reducers'),
      },
    },
    module: {
      // strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          exclude: /node_modules/,
          use: {
            loader: 'eslint-loader',
            options: {
              emitWarning: true,
            },
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8000,
                name: '[hash]-[name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: ['style-loader', CSSLoader, postCSSLoader, 'sass-loader'],
        },
        {
          test: /\.module\.scss$/,
          use: ['style-loader', CSSModuleLoader, postCSSLoader, 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [
                  require('postcss-flexbugs-fixes'),
                  autoprefixer({
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 9',
                    ],
                    flexbox: 'no-2009',
                  }),
                ],
              },
            },
          ],
        },
        // {
        //   test: /\.(png|svg|jpg|gif)$/,
        //   exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        //   use: {
        //     loader: 'file-loader',
        //   },
        // },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            template: './public/index.html',
            filename: './index.html',
          },
          isProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined,
        ),
      ),
      env.analyze ? new BundleAnalyzerPlugin() : () => {},
      isDevelopment ? new webpack.HotModuleReplacementPlugin() : () => {},
    ],
    performance: {
      hints: isProduction ? false : 'warning',
    },
  }
}
