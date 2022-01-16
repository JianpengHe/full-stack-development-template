const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
//const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackBar = require('webpackbar')
const { PROJECT_PATH } = require('../constant')
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'
const getCssLoaders = () => {
  const cssLoaders = [
    isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[local]--[hash:base64:5]',
        },
        sourceMap: isDevelopment,
      },
    },
  ]

  // 开发环境一般用chrom不会有问题，防止开发环境下看样式有一堆前缀影响查看，因此只在生产环境使用
  isProduction &&
    cssLoaders.push({
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            isProduction && [
              'postcss-preset-env',
              {
                autoprefixer: {
                  grid: true,
                },
              },
            ],
          ],
        },
      },
    })

  return cssLoaders
}

module.exports = {
  entry: {
    app: path.resolve(PROJECT_PATH, './src/frontend/index.tsx'),
  },
  module: {
    rules: [
      {
        test: /\.(tsx?|js)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },

      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [...getCssLoaders()],
      },
      {
        test: /\.css$/,
        // 排除业务模块，其他模块都不采用css modules方式解析
        exclude: /frontend/,
        use: ['style-loader', 'css-loader'],
      },

      {
        test: /\.less$/,
        use: [
          ...getCssLoaders(),
          {
            loader: 'less-loader',
            options: {
              sourceMap: isDevelopment,
            },
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      frontend: path.resolve(PROJECT_PATH, './frontend'),
      components: path.resolve(PROJECT_PATH, './frontend/components'),
      utils: path.resolve(PROJECT_PATH, './frontend/utils'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(PROJECT_PATH, './src/public/index.html'),
    }),
    new WebpackBar({
      name: '编译',
      color: '#52c41a',
    }),
    // new CopyPlugin({
    //   patterns: [
    //     {
    //       context: "public",
    //       from: "*",
    //       to: path.resolve(PROJECT_PATH, "./dist/public"),
    //       toType: "dir",
    //       globOptions: {
    //         dot: true,
    //         gitignore: true,
    //         ignore: ["**/index.html"], // **表示任意目录下
    //       },
    //     },
    //   ],
    // }),
  ],
}
